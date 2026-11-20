// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// GitHub issue triage. Dry run by default; pass --no-dry-run to apply.
//
//  --add-to-project  Issues that belong to no project (`no:project`) are added
//                    to the project.
//  --sync-labels     Keeps the product labels and the project's "Product" field
//                    in sync, in both directions:
//                      - field set:               labels are made to match the
//                                                 field (the field wins)
//                      - field unset, one label:  the field is set from the label
//                      - field unset, 2+ labels:  reported as a conflict, skipped
//                    Product labels are also created, or recoloured, to match
//                    their option's colour on the board.
//                    An empty Product with no label is valid ("no product",
//                    e.g. internal work). To remove a product on purpose, clear
//                    the field AND remove the label together: clearing only the
//                    field is undone from the label, and removing only the label
//                    is undone from the field.
//  --epic-to-feature Open issues labelled "Epic" get their issue Type set to
//                    "Feature" and the label removed (whatever --state is).
//  --unused-labels   Runs last. Lists repo labels on no issue or PR (open or
//                    closed) and asks which to delete. Product labels are
//                    managed by --sync-labels and never offered.
//
// With no step flags, all steps run; --unused-labels always runs last.
// --yes skips the confirmation prompt, for CI (.github/workflows/issue-cleanup.yml);
// it never deletes labels.
//
// Renaming a product label: rename it in the repo's label settings (it stays on
// every issue) and update its name in PRODUCTS.
// Retiring/merging a product: with the old entry still in PRODUCTS, move its
// issues to the new Product value and run --sync-labels, which swaps the
// labels. Then remove the old entry from PRODUCTS and the old option from the
// board; the old label is now unused and --unused-labels offers to delete it.
// (Dropping it from PRODUCTS first would leave the old label on every issue.)
//
// Uses the `gh` CLI, which authenticates with `GH_TOKEN` when it is set. The token
// needs the `repo` and `project` scopes (classic) or Issues + Projects write
// access (fine-grained).

import { spawn } from 'child_process'

import { program } from '@commander-js/extra-typings'
import { checkbox, confirm } from '@inquirer/prompts'
import * as colors from 'yoctocolors'

// yoctocolors only checks terminal support, so also drop colours when piped
const plain = (s: string) => s
const { bold, cyan, dim, green, red, yellow } = process.stdout.isTTY
    ? colors
    : {
          bold: plain,
          cyan: plain,
          dim: plain,
          green: plain,
          red: plain,
          yellow: plain,
      }

const PRODUCT_FIELD = 'Product'

// Product field option -> issue label. Labels missing from the repo are created.
const PRODUCTS: { option: string; label: string }[] = [
    { option: 'Wallet Gateway', label: 'wallet-gateway' },
    { option: 'Wallet Extension', label: 'wallet-extension' },
    { option: 'dApp SDK', label: 'dapp-sdk' },
    { option: 'Wallet SDK', label: 'wallet-sdk' },
    { option: 'Portfolio dApp', label: 'portfolio' },
]
const PRODUCT_LABELS = new Set(PRODUCTS.map((p) => p.label))

// --epic-to-feature: label (matched case-insensitively) -> issue type
const EPIC_LABEL = 'Epic'
const EPIC_TYPE = 'Feature'
const isEpicLabel = (name: string) =>
    name.toLowerCase() === EPIC_LABEL.toLowerCase()

// Project option colours are named; labels need hex. GitHub's own (Primer) shades.
const OPTION_COLORS: Record<string, string> = {
    GRAY: '6e7781',
    BLUE: '0969da',
    GREEN: '1a7f37',
    YELLOW: 'bf8700',
    ORANGE: 'bc4c00',
    RED: 'cf222e',
    PINK: 'bf3989',
    PURPLE: '8250df',
}

// A block of the given hex colour, on a terminal only
function swatch(hex: string): string {
    if (!process.stdout.isTTY) return ''
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
    return `\x1b[48;2;${r};${g};${b}m  \x1b[49m `
}

function gh(args: string[], input?: string): Promise<string> {
    const child = spawn('gh', args, { stdio: ['pipe', 'pipe', 'pipe'] })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (data) => (stdout += data.toString()))
    child.stderr.on('data', (data) => (stderr += data.toString()))
    child.stdin.end(input)

    return new Promise((resolve, reject) => {
        child.on('error', reject)
        child.on('close', (code) => {
            if (code !== 0) {
                reject(
                    new Error(
                        `gh ${args[0]} failed (${code}): ${stderr.trim()}`
                    )
                )
            } else {
                resolve(stdout)
            }
        })
    })
}

async function graphql<T>(
    query: string,
    variables: Record<string, unknown> = {}
): Promise<T> {
    const out = await gh(
        // Issue types needed this opt-in while in preview; harmless otherwise
        [
            'api',
            'graphql',
            '-H',
            'GraphQL-Features: issue_types',
            '--input',
            '-',
        ],
        JSON.stringify({ query, variables })
    )
    const res = JSON.parse(out) as { data: T; errors?: { message: string }[] }
    if (res.errors?.length) {
        throw new Error(res.errors.map((e) => e.message).join('; '))
    }
    return res.data
}

async function checkGh(): Promise<void> {
    try {
        await gh(['--version'])
    } catch {
        console.error(red('Error: gh CLI is not installed.'))
        console.error('https://cli.github.com/manual/installation')
        process.exit(1)
    }

    if (!process.env.GH_TOKEN) {
        console.warn(
            yellow('Warning: GH_TOKEN is not set; using gh CLI login.')
        )
    }

    try {
        await gh(['auth', 'status'])
    } catch (error) {
        console.error(red('Error: gh CLI is not authenticated.'))
        console.error((error as Error).message)
        process.exit(1)
    }
}

interface Project {
    id: string
    title: string
    productFieldId: string
    // Product option name -> option id
    productOptions: Map<string, string>
    // Product option name -> colour name (GRAY, BLUE, ...)
    productColors: Map<string, string>
}

async function loadProject(owner: string, number: number): Promise<Project> {
    const data = await graphql<{
        organization: {
            projectV2: {
                id: string
                title: string
                field: {
                    id: string
                    options?: { id: string; name: string; color: string }[]
                } | null
            } | null
        }
    }>(
        `
            query ($owner: String!, $number: Int!, $field: String!) {
                organization(login: $owner) {
                    projectV2(number: $number) {
                        id
                        title
                        field(name: $field) {
                            ... on ProjectV2SingleSelectField {
                                id
                                options {
                                    id
                                    name
                                    color
                                }
                            }
                        }
                    }
                }
            }
        `,
        { owner, number, field: PRODUCT_FIELD }
    )

    const project = data.organization.projectV2
    if (!project) {
        throw new Error(`Project ${owner}#${number} not found`)
    }
    if (!project.field?.options) {
        throw new Error(
            `Project "${project.title}" has no single-select field "${PRODUCT_FIELD}"`
        )
    }

    const productOptions = new Map(
        project.field.options.map((o) => [o.name, o.id])
    )
    const missing = PRODUCTS.filter((p) => !productOptions.has(p.option))
    if (missing.length) {
        throw new Error(
            `Field "${PRODUCT_FIELD}" is missing option(s) ${missing.map((p) => `"${p.option}"`).join(', ')} (has: ${[...productOptions.keys()].join(', ')})`
        )
    }
    const unmapped = [...productOptions.keys()].filter(
        (name) => !PRODUCTS.some((p) => p.option === name)
    )
    if (unmapped.length) {
        console.warn(
            yellow(
                `Warning: ${PRODUCT_FIELD} option(s) with no label mapping: ${unmapped.join(', ')}`
            )
        )
    }

    return {
        id: project.id,
        title: project.title,
        productFieldId: project.field.id,
        productOptions,
        productColors: new Map(
            project.field.options.map((o) => [o.name, o.color])
        ),
    }
}

interface Label {
    id: string
    name: string
    color: string
    description: string | null
    // Issues and PRs carrying the label, open or closed
    uses: number
}

interface Repo {
    // owner/name
    slug: string
    // Label name -> label id
    labels: Map<string, string>
    // Label name -> hex colour, lowercase, no `#`
    labelColors: Map<string, string>
    // Non-product labels on no issue or PR
    unusedLabels: Label[]
}

async function loadRepo(repo: string): Promise<Repo> {
    const [owner, name] = repo.split('/')
    const labels: Label[] = []
    let after: string | null = null

    do {
        const data: {
            repository: {
                labels: {
                    pageInfo: { hasNextPage: boolean; endCursor: string }
                    nodes: {
                        id: string
                        name: string
                        color: string
                        description: string | null
                        issues: { totalCount: number }
                        pullRequests: { totalCount: number }
                    }[]
                }
            }
        } = await graphql(
            `
                query ($owner: String!, $name: String!, $after: String) {
                    repository(owner: $owner, name: $name) {
                        labels(first: 100, after: $after) {
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                            nodes {
                                id
                                name
                                color
                                description
                                issues {
                                    totalCount
                                }
                                pullRequests {
                                    totalCount
                                }
                            }
                        }
                    }
                }
            `,
            { owner, name, after }
        )

        const page = data.repository.labels
        for (const l of page.nodes) {
            labels.push({
                id: l.id,
                name: l.name,
                color: l.color.toLowerCase(),
                description: l.description,
                uses: l.issues.totalCount + l.pullRequests.totalCount,
            })
        }
        after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
    } while (after)

    return {
        slug: repo,
        labels: new Map(labels.map((l) => [l.name, l.id])),
        labelColors: new Map(labels.map((l) => [l.name, l.color])),
        unusedLabels: labels
            .filter((l) => l.uses === 0 && !PRODUCT_LABELS.has(l.name))
            .sort((a, b) => a.name.localeCompare(b.name)),
    }
}

// Label writes use REST: the GraphQL label mutations have been preview-gated.
const labelPath = (repo: Repo, name?: string) =>
    `repos/${repo.slug}/labels${name ? `/${encodeURIComponent(name)}` : ''}`

async function createLabel(
    repo: Repo,
    name: string,
    color: string
): Promise<void> {
    const out = await gh([
        'api',
        '-X',
        'POST',
        labelPath(repo),
        '-f',
        `name=${name}`,
        '-f',
        `color=${color}`,
    ])
    repo.labels.set(name, (JSON.parse(out) as { node_id: string }).node_id)
    repo.labelColors.set(name, color)
}

async function recolorLabel(
    repo: Repo,
    name: string,
    color: string
): Promise<void> {
    await gh([
        'api',
        '-X',
        'PATCH',
        labelPath(repo, name),
        '-f',
        `color=${color}`,
    ])
    repo.labelColors.set(name, color)
}

async function deleteLabel(repo: Repo, label: Label): Promise<void> {
    await gh(['api', '-X', 'DELETE', labelPath(repo, label.name)])
}

type LabelAction =
    | { kind: 'create'; label: string; color: string; option: string }
    | {
          kind: 'recolor'
          label: string
          from: string
          color: string
          option: string
      }

// Product labels are created, or recoloured, to match their option's colour
function planLabels(project: Project, repo: Repo): LabelAction[] {
    return PRODUCTS.flatMap((p): LabelAction[] => {
        const optionColor = project.productColors.get(p.option) ?? 'GRAY'
        const color = OPTION_COLORS[optionColor] ?? OPTION_COLORS.GRAY!
        const current = repo.labelColors.get(p.label)
        if (current === undefined) {
            return [{ kind: 'create', label: p.label, color, option: p.option }]
        }
        if (current !== color) {
            return [
                {
                    kind: 'recolor',
                    label: p.label,
                    from: current,
                    color,
                    option: p.option,
                },
            ]
        }
        return []
    })
}

function labelActionLine(project: Project, action: LabelAction): string {
    const target = `${swatch(action.color)}#${action.color} ${dim(`(${action.option}: ${project.productColors.get(action.option)})`)}`
    return action.kind === 'create'
        ? `  ${green(`+ ${action.label.padEnd(20)}`)} ${target}`
        : `  ${yellow(`~ ${action.label.padEnd(20)}`)} ${swatch(action.from)}#${action.from} → ${target}`
}

interface Issue {
    id: string
    number: number
    title: string
    state: IssueState
    // Only loaded for --epic-to-feature
    issueType: string | null
    labels: { id: string; name: string }[]
    projectItems: {
        id: string
        project: { id: string }
        product: { name: string } | null
    }[]
}

type IssueState = 'OPEN' | 'CLOSED'

async function loadIssues(
    repo: string,
    states: IssueState[],
    withType: boolean
): Promise<Issue[]> {
    const [owner, name] = repo.split('/')
    const issues: Issue[] = []
    let after: string | null = null

    do {
        const data: {
            repository: {
                issues: {
                    pageInfo: { hasNextPage: boolean; endCursor: string }
                    nodes: {
                        id: string
                        number: number
                        title: string
                        state: IssueState
                        issueType?: { name: string } | null
                        labels: { nodes: { id: string; name: string }[] }
                        projectItems: {
                            nodes: {
                                id: string
                                project: { id: string }
                                product: { name: string } | null
                            }[]
                        }
                    }[]
                }
            }
        } = await graphql(
            `
                query (
                    $owner: String!
                    $name: String!
                    $states: [IssueState!]
                    $after: String
                    $field: String!
                    $withType: Boolean!
                ) {
                    repository(owner: $owner, name: $name) {
                        issues(first: 100, after: $after, states: $states) {
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                            nodes {
                                id
                                number
                                title
                                state
                                issueType @include(if: $withType) {
                                    name
                                }
                                labels(first: 50) {
                                    nodes {
                                        id
                                        name
                                    }
                                }
                                projectItems(first: 20) {
                                    nodes {
                                        id
                                        project {
                                            id
                                        }
                                        product: fieldValueByName(
                                            name: $field
                                        ) {
                                            ... on ProjectV2ItemFieldSingleSelectValue {
                                                name
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            { owner, name, states, after, field: PRODUCT_FIELD, withType }
        )

        const page = data.repository.issues
        for (const node of page.nodes) {
            issues.push({
                id: node.id,
                number: node.number,
                title: node.title,
                state: node.state,
                issueType: node.issueType?.name ?? null,
                labels: node.labels.nodes,
                projectItems: node.projectItems.nodes.map((item) => ({
                    ...item,
                    // Non-matching fragments come back as `{}`
                    product: item.product?.name ? item.product : null,
                })),
            })
        }
        after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
    } while (after)

    return issues
}

// Id of the issue type called `name`; throws listing the available ones
async function loadIssueTypeId(repo: string, name: string): Promise<string> {
    const [owner, repoName] = repo.split('/')
    const data = await graphql<{
        repository: {
            issueTypes: { nodes: { id: string; name: string }[] } | null
        }
    }>(
        `
            query ($owner: String!, $name: String!) {
                repository(owner: $owner, name: $name) {
                    issueTypes(first: 50) {
                        nodes {
                            id
                            name
                        }
                    }
                }
            }
        `,
        { owner, name: repoName }
    )
    const types = data.repository.issueTypes?.nodes ?? []
    const type = types.find((t) => t.name === name)
    if (!type) {
        throw new Error(
            `Issue type "${name}" not found in ${repo} (has: ${types.map((t) => t.name).join(', ') || 'none'})`
        )
    }
    return type.id
}

async function setIssueType(issue: Issue, issueTypeId: string): Promise<void> {
    await graphql(
        `
            mutation ($issueId: ID!, $issueTypeId: ID) {
                updateIssueIssueType(
                    input: { issueId: $issueId, issueTypeId: $issueTypeId }
                ) {
                    issue {
                        id
                    }
                }
            }
        `,
        { issueId: issue.id, issueTypeId }
    )
}

async function removeLabelIds(issue: Issue, labelIds: string[]): Promise<void> {
    await graphql(
        `
            mutation ($labelableId: ID!, $labelIds: [ID!]!) {
                removeLabelsFromLabelable(
                    input: { labelableId: $labelableId, labelIds: $labelIds }
                ) {
                    clientMutationId
                }
            }
        `,
        { labelableId: issue.id, labelIds }
    )
}

async function addToProject(project: Project, issue: Issue): Promise<string> {
    const data = await graphql<{
        addProjectV2ItemById: { item: { id: string } }
    }>(
        `
            mutation ($projectId: ID!, $contentId: ID!) {
                addProjectV2ItemById(
                    input: { projectId: $projectId, contentId: $contentId }
                ) {
                    item {
                        id
                    }
                }
            }
        `,
        { projectId: project.id, contentId: issue.id }
    )
    return data.addProjectV2ItemById.item.id
}

async function setProduct(
    project: Project,
    itemId: string,
    option: string
): Promise<void> {
    await graphql(
        `
            mutation (
                $projectId: ID!
                $itemId: ID!
                $fieldId: ID!
                $optionId: String!
            ) {
                updateProjectV2ItemFieldValue(
                    input: {
                        projectId: $projectId
                        itemId: $itemId
                        fieldId: $fieldId
                        value: { singleSelectOptionId: $optionId }
                    }
                ) {
                    projectV2Item {
                        id
                    }
                }
            }
        `,
        {
            projectId: project.id,
            itemId,
            fieldId: project.productFieldId,
            optionId: project.productOptions.get(option),
        }
    )
}

async function editLabels(
    repo: Repo,
    issue: Issue,
    add: string[],
    remove: string[]
): Promise<void> {
    const ids = (names: string[]) => names.map((n) => repo.labels.get(n)!)
    if (add.length) {
        await graphql(
            `
                mutation ($labelableId: ID!, $labelIds: [ID!]!) {
                    addLabelsToLabelable(
                        input: {
                            labelableId: $labelableId
                            labelIds: $labelIds
                        }
                    ) {
                        clientMutationId
                    }
                }
            `,
            { labelableId: issue.id, labelIds: ids(add) }
        )
    }
    if (remove.length) {
        await graphql(
            `
                mutation ($labelableId: ID!, $labelIds: [ID!]!) {
                    removeLabelsFromLabelable(
                        input: {
                            labelableId: $labelableId
                            labelIds: $labelIds
                        }
                    ) {
                        clientMutationId
                    }
                }
            `,
            { labelableId: issue.id, labelIds: ids(remove) }
        )
    }
}

type SyncAction =
    | { kind: 'field'; issue: Issue; option: string }
    | { kind: 'labels'; issue: Issue; add: string[]; remove: string[] }
    | { kind: 'conflict'; issue: Issue; labels: string[] }

function planSync(project: Project, issue: Issue): SyncAction | null {
    const product = issue.projectItems.find((p) => p.project.id === project.id)
        ?.product?.name
    const labels = issue.labels
        .map((l) => l.name)
        .filter((n) => PRODUCT_LABELS.has(n))

    if (product) {
        // The field wins: exactly its label (or none, for an unmapped option)
        const want = PRODUCTS.find((p) => p.option === product)?.label
        const add = want && !labels.includes(want) ? [want] : []
        const remove = labels.filter((l) => l !== want)
        return add.length || remove.length
            ? { kind: 'labels', issue, add, remove }
            : null
    }
    if (labels.length === 1) {
        const option = PRODUCTS.find((p) => p.label === labels[0])!.option
        return { kind: 'field', issue, option }
    }
    if (labels.length > 1) {
        return { kind: 'conflict', issue, labels }
    }
    return null
}

// Pad before colouring, so escape codes don't throw off the columns
function line(issue: Issue, note = ''): string {
    const title =
        issue.title.length > 60 ? `${issue.title.slice(0, 57)}...` : issue.title
    const prefix = `  ${dim(`#${String(issue.number).padEnd(5)}`)} `
    return note ? `${prefix}${title.padEnd(60)}  ${note}` : `${prefix}${title}`
}

function labelLine(label: Label): string {
    const name = `-${label.name}`
    return label.description
        ? `  ${red(name.padEnd(30))} ${dim(label.description)}`
        : `  ${red(name)}`
}

function describeEpic(issue: Issue): string {
    const labels = issue.labels
        .filter((l) => isEpicLabel(l.name))
        .map((l) => red(`-${l.name}`))
        .join(' ')
    const type =
        issue.issueType === EPIC_TYPE
            ? dim(`Type already ${EPIC_TYPE}`)
            : `${dim('Type:')} ${issue.issueType ?? 'none'} → ${green(EPIC_TYPE)}`
    return `${labels}  ${type}`
}

function header(step: string, summary: string): string {
    return `\n${bold(cyan(`[${step}]`))} ${bold(summary)}`
}

function describe(action: SyncAction): string {
    switch (action.kind) {
        case 'field':
            return `${dim('label →')} ${PRODUCT_FIELD} ${green(`= ${action.option}`)}`
        case 'labels':
            return `${dim(`${PRODUCT_FIELD} →`)} ${[
                ...action.add.map((l) => green(`+${l}`)),
                ...action.remove.map((l) => red(`-${l}`)),
            ].join(' ')}`
        case 'conflict':
            return yellow(
                `⚠ conflict: ${action.labels.join(', ')}, no ${PRODUCT_FIELD}`
            )
    }
}

void program
    .description(
        "Add project-less issues to the project, sync product labels with the project's Product field, and clean up unused labels. Runs all steps unless some are selected."
    )
    .option('--no-dry-run', 'Apply the changes (default: dry run)')
    .option(
        '--yes',
        'Apply without asking (for CI). Never deletes labels; --unused-labels only lists them'
    )
    .option('--add-to-project', 'Add issues with no project to the project')
    .option('--sync-labels', `Sync product labels <-> ${PRODUCT_FIELD} field`)
    .option(
        '--epic-to-feature',
        `Open "${EPIC_LABEL}" issues: set Type to "${EPIC_TYPE}", remove the label`
    )
    .option(
        '--unused-labels',
        'List labels on no issue or PR, and choose which to delete (runs last)'
    )
    .option('--repo <owner/name>', 'Repository', 'canton-network/wallet')
    .option(
        '--project-owner <org>',
        'Organization owning the project',
        'canton-network'
    )
    .option('--project-number <n>', 'Project number', '5')
    .option(
        '--state <state>',
        'Issue state to process: open, closed or all',
        'open'
    )
    .action(async (opts) => {
        const states: IssueState[] =
            opts.state === 'all'
                ? ['OPEN', 'CLOSED']
                : opts.state === 'closed'
                  ? ['CLOSED']
                  : opts.state === 'open'
                    ? ['OPEN']
                    : program.error(`Invalid --state: ${opts.state}`)
        const runAll =
            !opts.addToProject &&
            !opts.syncLabels &&
            !opts.epicToFeature &&
            !opts.unusedLabels
        const doAdd = runAll || !!opts.addToProject
        const doSync = runAll || !!opts.syncLabels
        const doEpic = runAll || !!opts.epicToFeature
        const doUnused = runAll || !!opts.unusedLabels

        await checkGh()

        const project = await loadProject(
            opts.projectOwner,
            Number(opts.projectNumber)
        )
        const repo = await loadRepo(opts.repo)
        const featureTypeId = doEpic
            ? await loadIssueTypeId(opts.repo, EPIC_TYPE)
            : ''
        // The epic step covers open issues even when --state excludes them
        const loadStates: IssueState[] =
            doEpic && !states.includes('OPEN') ? [...states, 'OPEN'] : states
        console.log(
            dim(
                `Loading ${opts.state} issues from ${opts.repo} (project "${project.title}")...`
            )
        )
        const loaded = await loadIssues(opts.repo, loadStates, doEpic)
        const issues = loaded.filter((i) => states.includes(i.state))

        const noProject = doAdd
            ? issues.filter((i) => i.projectItems.length === 0)
            : []
        const sync = doSync
            ? issues
                  .map((i) => planSync(project, i))
                  .filter((a): a is SyncAction => a !== null)
            : []
        const changes = sync.filter((a) => a.kind !== 'conflict')
        const conflicts = sync.filter((a) => a.kind === 'conflict')
        const labelActions = doSync ? planLabels(project, repo) : []
        const epics = doEpic
            ? loaded.filter(
                  (i) =>
                      i.state === 'OPEN' &&
                      i.labels.some((l) => isEpicLabel(l.name))
              )
            : []

        if (doAdd) {
            console.log(
                header(
                    'add-to-project',
                    `Add to "${project.title}": ${noProject.length} issue(s)`
                )
            )
            noProject.forEach((i) => console.log(line(i)))
        }
        if (doSync) {
            console.log(
                header(
                    'sync-labels',
                    `${labelActions.length} label(s) to create/recolour, ${changes.length} issue change(s), ${conflicts.length} conflict(s)`
                )
            )
            labelActions.forEach((a) =>
                console.log(labelActionLine(project, a))
            )
            changes.forEach((a) => console.log(line(a.issue, describe(a))))
            conflicts.forEach((a) => console.log(line(a.issue, describe(a))))
        }
        if (doEpic) {
            console.log(
                header(
                    'epic-to-feature',
                    `${epics.length} open "${EPIC_LABEL}" issue(s)`
                )
            )
            epics.forEach((i) => console.log(line(i, describeEpic(i))))
        }
        if (doUnused) {
            console.log(
                header(
                    'unused-labels',
                    `${repo.unusedLabels.length} label(s) on no issue or PR`
                )
            )
            repo.unusedLabels.forEach((l) => console.log(labelLine(l)))
        }

        if (opts.dryRun) {
            console.log(
                `\n${bold(yellow('Dry run:'))} ${yellow('no changes made. Re-run with --no-dry-run to apply.')}`
            )
            return
        }

        const failures: string[] = []
        if (
            noProject.length +
                labelActions.length +
                changes.length +
                epics.length >
            0
        ) {
            const proceed =
                opts.yes ||
                (await confirm({
                    message: `Apply the label and issue changes above to ${opts.repo}?`,
                    default: false,
                }))
            if (proceed) {
                await applyIssueChanges()
            } else {
                console.log(yellow('Skipped issue changes.'))
            }
        }
        if (doUnused) {
            await cleanUpLabels()
        }

        if (conflicts.length) {
            console.log(
                yellow(
                    `\n⚠ ${conflicts.length} conflict(s) skipped; set ${PRODUCT_FIELD} on them by hand and re-run.`
                )
            )
        }
        if (failures.length) {
            console.error(
                red(
                    `\n✗ ${failures.length} change(s) failed: ${failures.join(', ')}. Re-run to retry.`
                )
            )
            process.exit(1)
        }
        console.log(bold(green('\n✓ Done.')))

        async function cleanUpLabels(): Promise<void> {
            if (opts.yes) {
                console.log(
                    yellow(
                        '\nSkipped deleting unused labels: --yes never deletes labels; run without it to choose.'
                    )
                )
                return
            }
            // Re-check: counts may have moved since the plan was printed
            const { unusedLabels } = await loadRepo(opts.repo)
            if (!unusedLabels.length) {
                console.log(header('unused-labels', 'none to delete'))
                return
            }

            console.log(header('unused-labels', 'choose labels to delete'))
            const selected = await checkbox({
                message: `Delete which unused label(s)? Deleting cannot be undone.`,
                choices: unusedLabels.map((l) => ({
                    name: l.name,
                    value: l,
                    ...(l.description && { description: l.description }),
                })),
                pageSize: Math.min(
                    unusedLabels.length,
                    (process.stdout.rows ?? 20) - 4
                ),
            })
            if (!selected.length) {
                console.log(yellow('No labels deleted.'))
                return
            }

            const ok = await confirm({
                message: `Delete ${selected.length} label(s): ${selected.map((l) => l.name).join(', ')}?`,
                default: false,
            })
            if (!ok) {
                console.log(yellow('No labels deleted.'))
                return
            }

            for (const label of selected) {
                try {
                    await deleteLabel(repo, label)
                    console.log(`  ${green('✓')} ${red(`-${label.name}`)}`)
                } catch (error) {
                    console.log(
                        `  ${red('✗')} ${label.name}: ${red((error as Error).message)}`
                    )
                    failures.push(`label "${label.name}"`)
                }
            }
        }

        async function applyIssueChanges(): Promise<void> {
            const attempt = async (issue: Issue, step: () => Promise<void>) => {
                try {
                    await step()
                    console.log(`  ${green('✓')} #${issue.number}`)
                } catch (error) {
                    console.log(
                        `  ${red('✗')} #${issue.number}: ${red((error as Error).message)}`
                    )
                    failures.push(`#${issue.number}`)
                }
            }

            if (noProject.length) {
                console.log(
                    header('add-to-project', `${noProject.length} issue(s)...`)
                )
                for (const issue of noProject) {
                    await attempt(issue, async () => {
                        await addToProject(project, issue)
                    })
                }
            }

            if (labelActions.length) {
                console.log(
                    header('sync-labels', `${labelActions.length} label(s)...`)
                )
                for (const action of labelActions) {
                    try {
                        if (action.kind === 'create') {
                            await createLabel(repo, action.label, action.color)
                        } else {
                            await recolorLabel(repo, action.label, action.color)
                        }
                        console.log(labelActionLine(project, action))
                    } catch (error) {
                        // Issues needing a label that failed to create then fail individually
                        console.log(
                            `  ${red('✗')} ${action.label}: ${red((error as Error).message)}`
                        )
                        failures.push(`label "${action.label}"`)
                    }
                }
            }

            if (changes.length) {
                console.log(
                    header('sync-labels', `${changes.length} issue(s)...`)
                )
                for (const action of changes) {
                    await attempt(action.issue, async () => {
                        if (action.kind === 'field') {
                            // Idempotent: returns the existing item if already in the project
                            const itemId = await addToProject(
                                project,
                                action.issue
                            )
                            await setProduct(project, itemId, action.option)
                        } else if (action.kind === 'labels') {
                            await editLabels(
                                repo,
                                action.issue,
                                action.add,
                                action.remove
                            )
                        }
                    })
                }
            }

            if (epics.length) {
                console.log(
                    header('epic-to-feature', `${epics.length} issue(s)...`)
                )
                for (const issue of epics) {
                    await attempt(issue, async () => {
                        if (issue.issueType !== EPIC_TYPE) {
                            await setIssueType(issue, featureTypeId)
                        }
                        // Removed last, so a failed issue keeps the label and a re-run retries it
                        await removeLabelIds(
                            issue,
                            issue.labels
                                .filter((l) => isEpicLabel(l.name))
                                .map((l) => l.id)
                        )
                    })
                }
            }
        }
    })
    .parseAsync(process.argv)
