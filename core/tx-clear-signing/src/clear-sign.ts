// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Identifier,
    Metadata,
    Value,
} from '@canton-network/core-ledger-proto'
import type {
    ClearSigner,
    ClearSigningResult,
    ClearSignRequest,
    DescribedField,
    OperationDescription,
    TemplateRef,
} from '@canton-network/core-tx-clear-signing-lib'

import {
    DescriptorError,
    parseDescriptor,
    type Descriptor,
    type Exercise,
    type Field,
    type Operation,
} from './descriptor.ts'
import { ClearSignError } from './errors.ts'
import {
    FormatError,
    formatValue,
    sanitize,
    type EnumTables,
} from './format.ts'
import { hashesTo } from './hash.ts'
import { parseIntent } from './intent.ts'
import {
    CONTRACT_PREFIX,
    containerFieldName,
    containerValue,
    isNone,
    parsePath,
    PathError,
    resolvePath,
    type ContainerFields,
} from './path.ts'
import {
    contractArgument,
    contractsOf,
    decode,
    rootNodes,
    templateKey,
    templateRef,
    type ContractSet,
    type RootNode,
} from './roots.ts'
import { verifySignatures } from './signature.ts'
import { parseJsonStrict, StrictJsonError } from './strict-json.ts'
import { TRUSTED_KEYS } from './trusted-keys.ts'

/** Shown when an interpolated intent cannot be filled from the transaction. */
export const MISMATCH_INTENT = 'The descriptor does not match this transaction.'

/**
 * Describes each root node of a prepared transaction with the descriptor bound to its template.
 * Child nodes are consequences of their root's choice, which the root's descriptor words.
 *
 * A descriptor binds to a root by package ID, module and entity. Descriptors that bind to no root
 * are ignored. A bound descriptor is used only when every signature on it verifies against
 * {@link TRUSTED_KEYS}, the keys bundled from `trusted-keys.json`. Otherwise that root is
 * `unverified` and its wording is not shown. The description is only as trustworthy as its binding
 * to what is signed, so the transaction is described only when it hashes to `expectedHash`.
 *
 * @throws ClearSignError `HASH_MISMATCH` when the transaction does not hash to
 * `preparedTransactionHash`, `HASH_UNVERIFIABLE` when it cannot be hashed, and
 * `MALFORMED_TRANSACTION` when it hashes and cannot be read
 */
export async function clearSign({
    preparedTransaction: tx,
    preparedTransactionHash: expectedHash,
    descriptors,
}: ClearSignRequest): Promise<ClearSigningResult> {
    const matches = await hashesTo(tx, expectedHash)
    if (!matches) {
        throw new ClearSignError(
            'HASH_MISMATCH',
            `prepared transaction does not hash to '${expectedHash}'`
        )
    }
    const prepared = decode(tx)
    const roots = rootNodes(prepared)
    const contracts = contractsOf(prepared)
    const bindings = await bindDescriptors(descriptors, roots.map(nodeHeader))
    const operations = roots.map((node) =>
        describeNode(node, contracts, bindings, prepared.metadata)
    )
    return { operations }
}

/** The implementation of the clear-signing interface. */
export const clearSigner: ClearSigner = { clearSign }

/**
 * A descriptor bound to a root template: verified, unverified, or why it cannot be parsed.
 * Two descriptors for one template are `problems`, which the root reports as `invalid`.
 */
type Binding =
    | { descriptor: Descriptor }
    | { unverified: readonly string[] }
    | { problems: readonly string[] }

async function bindDescriptors(
    descriptors: readonly string[],
    roots: readonly Header[]
): Promise<Map<string, Binding>> {
    const rootKeys = new Set(
        roots.flatMap(({ template }) =>
            template ? [templateKey(template)] : []
        )
    )
    const bindings = new Map<string, Binding>()
    for (const text of descriptors) {
        let json: unknown
        try {
            json = parseJsonStrict(text)
        } catch (err) {
            if (!(err instanceof StrictJsonError)) throw err
            // The text is not the document that would be signed. JSON.parse only locates the
            // template the duplicate or the bad text would have been bound to.
            setBinding(bindings, rootKeys, readTemplate(lenientJson(text)), {
                problems: [err.message],
            })
            continue
        }
        setBinding(bindings, rootKeys, readTemplate(json), await bind(json))
    }
    return bindings
}

function setBinding(
    bindings: Map<string, Binding>,
    rootKeys: ReadonlySet<string>,
    template: TemplateRef | undefined,
    binding: Binding
): void {
    const key = template && templateKey(template)
    if (!key || !rootKeys.has(key)) return
    if (bindings.has(key)) {
        bindings.set(key, {
            problems: [`more than one descriptor for template '${key}'`],
        })
        return
    }
    bindings.set(key, binding)
}

function lenientJson(text: string): unknown {
    try {
        return JSON.parse(text)
    } catch {
        return undefined
    }
}

/** Signatures first. An unsigned descriptor is `unverified` even when the rest would not parse. */
async function bind(json: unknown): Promise<Binding> {
    const verified = await verifySignatures(json, TRUSTED_KEYS)
    if (!verified.ok) return { unverified: verified.problems }
    try {
        return { descriptor: parseDescriptor(json) }
    } catch (err) {
        if (!(err instanceof DescriptorError)) throw err
        return { problems: err.problems }
    }
}

/**
 * The template a descriptor text names, read leniently: it is found even when the text does not
 * parse strictly or the document is invalid. Undefined when no template can be read.
 */
export function readDescriptorTemplate(text: string): TemplateRef | undefined {
    return readTemplate(lenientJson(text))
}

/** `context.template`, read leniently, so an invalid descriptor can still be bound and reported. */
function readTemplate(json: unknown): TemplateRef | undefined {
    const template = (
        json as { context?: { template?: Record<string, unknown> } } | null
    )?.context?.template
    const packageId = nonEmpty(template?.packageId)
    const moduleName = nonEmpty(template?.moduleName)
    const entityName = nonEmpty(template?.entityName)
    if (!packageId || !moduleName || !entityName) return undefined
    return { packageId, moduleName, entityName }
}

function nonEmpty(value: unknown): string | undefined {
    return typeof value === 'string' && value !== '' ? value : undefined
}

type Header =
    | { kind: 'create'; template: TemplateRef }
    | {
          kind: 'exercise'
          template: TemplateRef
          choiceId: string
          interface?: TemplateRef
      }
    | { kind: 'other'; template?: TemplateRef }

function describeNode(
    node: RootNode,
    contracts: ContractSet,
    bindings: Map<string, Binding>,
    metadata: Metadata | undefined
): OperationDescription {
    // `header` binds the descriptor and selects the exercise entry. What is shown is sanitized: the
    // names come from the transaction.
    const header = nodeHeader(node)
    const generic = {
        ...shownHeader(header),
        intent: sanitize(genericIntent(node)),
        fields: [],
    }
    if (node.kind === 'other') {
        const reason = `root node '${node.nodeId}' is a '${node.nodeType}' node`
        return { ...generic, status: 'indescribable', reason: sanitize(reason) }
    }
    const binding =
        header.template && bindings.get(templateKey(header.template))
    if (!binding) {
        return { ...generic, status: 'undescribed' }
    }
    if ('unverified' in binding) {
        return {
            ...generic,
            status: 'unverified',
            reason: sanitize(binding.unverified.join('; ')),
        }
    }
    if ('problems' in binding) {
        return {
            ...generic,
            status: 'invalid',
            reason: sanitize(binding.problems.join('; ')),
        }
    }
    const { descriptor } = binding
    const described = {
        ...generic,
        descriptor: descriptorInfo(descriptor),
    }
    const operation =
        node.kind === 'create'
            ? descriptor.display.create
            : exerciseEntry(
                  descriptor.display.exercises,
                  node.exercise.choiceId,
                  header.kind === 'exercise' ? header.interface : undefined
              )
    if (!operation) {
        return { ...described, status: 'undescribed' }
    }
    const args = argumentsOf(node, contracts, metadata)
    if ('reason' in args) {
        return {
            ...described,
            status: 'indescribable',
            reason: sanitize(args.reason),
        }
    }
    const enums = descriptor.metadata.enums ?? {}
    return { ...described, ...describeOperation(operation, args, enums) }
}

function nodeHeader(node: RootNode): Header {
    switch (node.kind) {
        case 'create':
            return {
                kind: 'create',
                template: templateRef(node.create.templateId, node.nodeId),
            }
        case 'exercise': {
            const { templateId, choiceId, interfaceId } = node.exercise
            return {
                kind: 'exercise',
                template: templateRef(templateId, node.nodeId),
                choiceId,
                ...(interfaceId && {
                    interface: templateRef(interfaceId, node.nodeId),
                }),
            }
        }
        case 'other':
            return {
                kind: 'other',
                ...(node.template && { template: node.template }),
            }
    }
}

/** The header with each name escaped as `sanitize` escapes a value from the transaction. */
function shownHeader(header: Header): Header {
    switch (header.kind) {
        case 'create':
            return {
                kind: 'create',
                template: shownTemplate(header.template),
            }
        case 'exercise':
            return {
                kind: 'exercise',
                template: shownTemplate(header.template),
                choiceId: sanitize(header.choiceId),
                ...(header.interface && {
                    interface: shownTemplate(header.interface),
                }),
            }
        case 'other':
            return {
                kind: 'other',
                ...(header.template && {
                    template: shownTemplate(header.template),
                }),
            }
    }
}

function shownTemplate(t: TemplateRef): TemplateRef {
    return {
        packageId: sanitize(t.packageId),
        moduleName: sanitize(t.moduleName),
        entityName: sanitize(t.entityName),
    }
}

/** The intent shown when no descriptor words the node. */
function genericIntent(node: RootNode): string {
    switch (node.kind) {
        case 'create':
            return `Create ${typeName(node.create.templateId)}`
        case 'exercise':
            return `Exercise ${node.exercise.choiceId} on ${typeName(node.exercise.templateId)}`
        case 'other':
            return `Cannot describe ${node.nodeType} node`
    }
}

function typeName(id: Identifier | undefined): string {
    return `${id?.moduleName}:${id?.entityName}`
}

function descriptorInfo({
    metadata,
}: Descriptor): NonNullable<OperationDescription['descriptor']> {
    const { name, publisher, version, url } = metadata
    return {
        name: sanitize(name),
        publisher: sanitize(publisher),
        version,
        ...(url !== undefined && { url }),
    }
}

/**
 * The exercise entry for a node. An entry matches when its choice and its interface both equal the
 * node's. Interface identity is the module and entity. When the entry sets `packageId`, that must
 * equal the node's interface package too. When it omits `packageId`, the module and entity match on
 * any package: the template's package ID already selects the interface package the template was
 * compiled against. An entry that sets the package is preferred over one that omits it. When the
 * node carries an interface and no entry names that choice and interface, the entry for the same
 * choice with no interface is used. A node with no interface matches only that entry. An entry that
 * names one interface never matches a node exercised through another, or through none.
 */
function exerciseEntry(
    exercises: readonly Exercise[] | undefined,
    choiceId: string,
    iface: TemplateRef | undefined
): Exercise | undefined {
    const forChoice =
        exercises?.filter((entry) => entry.choice === choiceId) ?? []
    if (iface) {
        const pinned = forChoice.find((entry) =>
            sameInterface(entry.interface, iface, true)
        )
        if (pinned) return pinned
        const unpinned = forChoice.find((entry) =>
            sameInterface(entry.interface, iface, false)
        )
        if (unpinned) return unpinned
    }
    return forChoice.find((entry) => entry.interface === undefined)
}

/**
 * Module and entity. `pinned` selects entries that also name `iface`'s package ID. Otherwise the
 * entry must omit `packageId`. An entry with no interface does not match.
 */
function sameInterface(
    entry: Exercise['interface'],
    iface: TemplateRef,
    pinned: boolean
): boolean {
    if (!entry) return false
    if ((entry.packageId !== undefined) !== pinned) return false
    if (pinned && entry.packageId !== iface.packageId) return false
    return (
        entry.moduleName === iface.moduleName &&
        entry.entityName === iface.entityName
    )
}

/**
 * The values a field's path starts at: the create or choice argument, and for an exercise, the
 * create argument of the contract it acts on, which `@.contract.` paths read.
 */
interface Arguments {
    argument: Value | undefined
    contract: Value | undefined
    container: ContainerFields
}

function argumentsOf(
    node: Exclude<RootNode, { kind: 'other' }>,
    contracts: ContractSet,
    metadata: Metadata | undefined
): Arguments | { reason: string } {
    const container = containerOf(node, metadata)
    if (node.kind === 'create') {
        return {
            argument: node.create.argument,
            contract: undefined,
            container,
        }
    }
    const lookedUp = contractArgument(contracts, node.exercise)
    if ('reason' in lookedUp) return lookedUp
    return {
        argument: node.exercise.chosenValue,
        contract: lookedUp.argument,
        container,
    }
}

function containerOf(
    node: Exclude<RootNode, { kind: 'other' }>,
    metadata: Metadata | undefined
): ContainerFields {
    const shared = {
        synchronizerId: metadata?.synchronizerId ?? '',
        actAs: metadata?.submitterInfo?.actAs ?? [],
    }
    if (node.kind === 'create') {
        const { contractId, signatories, stakeholders } = node.create
        return {
            kind: 'create',
            contractId,
            signatories,
            stakeholders,
            ...shared,
        }
    }
    const {
        contractId,
        signatories,
        stakeholders,
        actingParties,
        choiceObservers,
        consuming,
    } = node.exercise
    return {
        kind: 'exercise',
        contractId,
        signatories,
        stakeholders,
        actingParties,
        choiceObservers,
        consuming,
        ...shared,
    }
}

function describeOperation(
    op: Operation,
    args: Arguments,
    enums: EnumTables
): Pick<OperationDescription, 'status' | 'intent' | 'reason' | 'fields'> {
    const declared = op.fields ?? []
    const fields = declared.map((f) => describeField(f, args, enums))
    if (op.interpolatedIntent === undefined) {
        return { status: 'described', intent: sanitize(op.intent), fields }
    }
    const byPath = new Map(declared.map((f, i) => [f.path, fields[i]]))
    const intent = interpolate(op.interpolatedIntent, byPath)
    if (intent === undefined) {
        return {
            status: 'unfilled',
            intent: MISMATCH_INTENT,
            reason: sanitize(mismatchReason(op.interpolatedIntent, byPath)),
            fields,
        }
    }
    return { status: 'described', intent: sanitize(intent), fields }
}

/** Why an interpolated intent could not be filled, one failing placeholder at a time. */
function mismatchReason(
    interpolatedIntent: string,
    fields: Map<string, DescribedField | undefined>
): string {
    const failed: string[] = []
    for (const segment of parseIntent(interpolatedIntent)) {
        if (segment.kind !== 'placeholder') continue
        const field = fields.get(segment.path)
        if (field && 'value' in field) continue
        const error = field && 'error' in field ? field.error : 'has no field'
        failed.push(`placeholder '{${segment.path}}' failed: ${error}`)
    }
    return failed.join('; ')
}

/** Fills each placeholder with its field's value. Undefined when a field has no value. */
function interpolate(
    interpolatedIntent: string,
    fields: Map<string, DescribedField | undefined>
): string | undefined {
    let intent = ''
    for (const segment of parseIntent(interpolatedIntent)) {
        if (segment.kind === 'text') {
            intent += segment.text
            continue
        }
        const field = fields.get(segment.path)
        if (!field || !('value' in field)) return undefined
        intent += field.value
    }
    return intent
}

function describeField(
    field: Field,
    args: Arguments,
    enums: EnumTables
): DescribedField {
    const label = sanitize(field.label ?? field.path)
    try {
        return { label, value: fieldValue(field, args, enums) }
    } catch (err) {
        if (!(err instanceof PathError || err instanceof FormatError)) throw err
        return { label, error: sanitize(err.message) }
    }
}

/**
 * Resolves and formats a field. `None`, whether the ledger kept it or left the field out, fails the
 * field unless it is `optional`; then it is shown as `None`. A mistyped path looks the same as a
 * field the ledger left out.
 */
function fieldValue(field: Field, args: Arguments, enums: EnumTables): string {
    const container = containerFieldName(field.path)
    if (container !== undefined) {
        return formatValue(
            containerValue(container, args.container),
            field,
            enums
        )
    }
    const readsContract = field.path.startsWith(CONTRACT_PREFIX)
    const start = readsContract ? args.contract : args.argument
    if (!start) {
        throw new PathError(`'${field.path}' has no value to start from`)
    }
    const path = readsContract
        ? field.path.slice(CONTRACT_PREFIX.length)
        : field.path
    const resolved = resolvePath(start, parsePath(path))
    if (!isNone(resolved.value)) {
        return formatValue(resolved.value, field, enums)
    }
    if (field.optional) {
        return 'None'
    }
    throw new PathError(
        resolved.absentField === undefined
            ? `'${field.path}' is None`
            : `'${resolved.absentField}' is not in the transaction`
    )
}
