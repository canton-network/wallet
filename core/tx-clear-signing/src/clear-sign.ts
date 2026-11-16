// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Identifier,
    Metadata,
    Value,
} from '@canton-network/core-ledger-proto'
import {
    DescriptorError,
    parseDescriptor,
    type Descriptor,
    type Exercise,
    type Field,
    type Operation,
} from './descriptor.js'
import { FormatError, formatValue, type EnumTables } from './format.js'
import { hashesTo } from './hash.js'
import { parseIntent } from './intent.js'
import {
    CONTRACT_PREFIX,
    containerFieldName,
    containerValue,
    isNone,
    parsePath,
    PathError,
    resolvePath,
    type ContainerFields,
} from './path.js'
import {
    contractArgument,
    contractsOf,
    decode,
    rootNodes,
    templateKey,
    templateRef,
    type ContractSet,
    type RootNode,
    type TemplateRef,
} from './roots.js'

/** Shown when an interpolated intent cannot be filled from the transaction. */
export const MISMATCH_INTENT = 'The descriptor does not match this transaction.'

/** A field as shown to the user: its formatted value, or why it cannot be shown. */
export type DescribedField =
    | { label: string; value: string }
    | { label: string; error: string }

/**
 * How one root node of a prepared transaction is shown.
 *
 * `kind`, `template`, `choiceId` and `interface` are read from the transaction, so a descriptor
 * cannot change what the user is told is being done. `fields` and `descriptor` come from the
 * descriptor bound to `template`. `intent` does too, except when interpolation fails: then it says
 * the descriptor does not match the transaction.
 */
export interface OperationDescription {
    kind: 'create' | 'exercise' | 'other'
    /** Absent for a root that is not a create or an exercise and carries no template. */
    template?: TemplateRef
    /** The exercised choice. */
    choiceId?: string
    /** The interface the choice is exercised through, if any. */
    interface?: TemplateRef
    /**
     * - `described`: `intent` is the descriptor's interpolated intent, or its stable intent when it
     *   has no interpolated one.
     * - `fallback`: a placeholder's field could not be shown, so `intent` says the descriptor does
     *   not match the transaction. `reason` names the placeholder.
     * - `undescribed`: no descriptor words the node, so `intent` is generic.
     * - `invalid`: the descriptor bound to the node is not valid, or there is more than one, so
     *   `intent` is generic and `reason` says why.
     * - `undescribable`: the node cannot be read, so `intent` is generic and `reason` says why.
     */
    status:
        | 'described'
        | 'fallback'
        | 'undescribed'
        | 'invalid'
        | 'undescribable'
    reason?: string
    /** Who the valid bound descriptor says wrote it. Descriptors are unsigned in v1, so this is a claim. */
    descriptor?: {
        name: string
        publisher: string
        version: string
        url?: string
    }
    /** The sentence the user reads. Text values from the transaction are JSON-quoted. */
    intent: string
    fields: DescribedField[]
}

export interface ClearSigningResult {
    /** True when every root is `described` and every field has a value. */
    complete: boolean
    /** One entry per root node, in order. */
    operations: OperationDescription[]
}

export class HashMismatchError extends Error {
    constructor(expectedHash: string) {
        super(`prepared transaction does not hash to '${expectedHash}'`)
        this.name = 'HashMismatchError'
    }
}

/**
 * Describes each root node of a prepared transaction with the descriptor bound to its template.
 * Child nodes are consequences of their root's choice, which the root's descriptor words.
 *
 * A descriptor binds to a root by package ID, module and entity. Descriptors that bind to no root
 * are ignored. The description is only as trustworthy as its binding to what is signed, so the
 * transaction is described only when it hashes to `expectedHash`.
 *
 * @param tx - the prepared transaction, base64-encoded
 * @param descriptors - clear-signing descriptors; any number, valid or not
 * @param expectedHash - the hash the user is asked to approve, base64-encoded
 * @throws HashMismatchError when the transaction does not hash to `expectedHash`
 * @throws Error when the transaction cannot be hashed or is malformed
 */
export async function clearSign(
    tx: string,
    descriptors: readonly Descriptor[],
    expectedHash: string
): Promise<ClearSigningResult> {
    const matches = await hashesTo(tx, expectedHash)
    if (!matches) {
        throw new HashMismatchError(expectedHash)
    }
    const prepared = decode(tx)
    const roots = rootNodes(prepared)
    const contracts = contractsOf(prepared)
    const bindings = bindDescriptors(descriptors, roots.map(nodeHeader))
    const operations = roots.map((node) =>
        describeNode(node, contracts, bindings, prepared.metadata)
    )
    const complete = operations.every(
        (op) =>
            op.status === 'described' && op.fields.every((f) => 'value' in f)
    )
    return { complete, operations }
}

/** A descriptor bound to a root template: valid, or why it cannot be used. */
type Binding = { descriptor: Descriptor } | { problems: readonly string[] }

function bindDescriptors(
    descriptors: readonly unknown[],
    roots: readonly Header[]
): Map<string, Binding> {
    const rootKeys = new Set(
        roots.flatMap(({ template }) =>
            template ? [templateKey(template)] : []
        )
    )
    const bindings = new Map<string, Binding>()
    for (const json of descriptors) {
        const template = readTemplate(json)
        const key = template && templateKey(template)
        if (!key || !rootKeys.has(key)) continue
        if (bindings.has(key)) {
            bindings.set(key, {
                problems: [`more than one descriptor for template '${key}'`],
            })
            continue
        }
        bindings.set(key, bind(json))
    }
    return bindings
}

function bind(json: unknown): Binding {
    try {
        return { descriptor: parseDescriptor(json) }
    } catch (err) {
        if (!(err instanceof DescriptorError)) throw err
        return { problems: err.problems }
    }
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

type Header = Pick<
    OperationDescription,
    'kind' | 'template' | 'choiceId' | 'interface'
>

function describeNode(
    node: RootNode,
    contracts: ContractSet,
    bindings: Map<string, Binding>,
    metadata: Metadata | undefined
): OperationDescription {
    const header = nodeHeader(node)
    const generic = { ...header, intent: genericIntent(node), fields: [] }
    if (node.kind === 'other') {
        const reason = `root node '${node.nodeId}' is a '${node.nodeType}' node`
        return { ...generic, status: 'undescribable', reason }
    }
    const binding =
        header.template && bindings.get(templateKey(header.template))
    if (!binding) {
        return { ...generic, status: 'undescribed' }
    }
    if ('problems' in binding) {
        const reason = binding.problems.join('; ')
        return { ...generic, status: 'invalid', reason }
    }
    const { descriptor } = binding
    const described = { ...generic, descriptor: descriptorInfo(descriptor) }
    const operation =
        node.kind === 'create'
            ? descriptor.display.create
            : exerciseEntry(
                  descriptor.display.exercises,
                  node.exercise.choiceId,
                  header.interface
              )
    if (!operation) {
        return { ...described, status: 'undescribed' }
    }
    const args = argumentsOf(node, contracts, metadata)
    if ('reason' in args) {
        return { ...described, status: 'undescribable', reason: args.reason }
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
    return { name, publisher, version, ...(url !== undefined && { url }) }
}

/**
 * The exercise entry for a node. The choice and the interface must both match: an entry without an
 * interface matches only a node exercised as the template's own choice.
 */
function exerciseEntry(
    exercises: readonly Exercise[] | undefined,
    choiceId: string,
    iface: TemplateRef | undefined
): Exercise | undefined {
    return exercises?.find(
        (e) =>
            e.choice === choiceId &&
            e.interface?.moduleName === iface?.moduleName &&
            e.interface?.entityName === iface?.entityName
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
            actingParties: [],
            choiceObservers: [],
            consuming: false,
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
        return { status: 'described', intent: op.intent, fields }
    }
    const byPath = new Map(declared.map((f, i) => [f.path, fields[i]]))
    const intent = interpolate(op.interpolatedIntent, byPath)
    if (intent === undefined) {
        return {
            status: 'fallback',
            intent: MISMATCH_INTENT,
            reason: mismatchReason(op.interpolatedIntent, byPath),
            fields,
        }
    }
    return { status: 'described', intent, fields }
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
    const label = field.label ?? field.path
    try {
        return { label, value: fieldValue(field, args, enums) }
    } catch (err) {
        if (!(err instanceof PathError || err instanceof FormatError)) throw err
        return { label, error: err.message }
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
