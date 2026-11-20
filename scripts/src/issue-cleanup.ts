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
//
// With neither flag, both steps run.
//
// Uses the `gh` CLI, which authenticates with `GH_TOKEN` when it is set. The token
// needs the `repo` and `project` scopes (classic) or Issues + Projects write
// access (fine-grained).

import { spawn } from 'child_process'

import { program } from '@commander-js/extra-typings'
import { confirm } from '@inquirer/prompts'

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
        ['api', 'graphql', '--input', '-'],
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
        console.error('Error: gh CLI is not installed.')
        console.error('https://cli.github.com/manual/installation')
        process.exit(1)
    }

    if (!process.env.GH_TOKEN) {
        console.warn('Warning: GH_TOKEN is not set; using gh CLI login.')
    }

    try {
        await gh(['auth', 'status'])
    } catch (error) {
        console.error('Error: gh CLI is not authenticated.')
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
}

async function loadProject(owner: string, number: number): Promise<Project> {
    const data = await graphql<{
        organization: {
            projectV2: {
                id: string
                title: string
                field: {
                    id: string
                    options?: { id: string; name: string }[]
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
            `Warning: ${PRODUCT_FIELD} option(s) with no label mapping: ${unmapped.join(', ')}`
        )
    }

    return {
        id: project.id,
        title: project.title,
        productFieldId: project.field.id,
        productOptions,
    }
}

interface Repo {
    id: string
    // Label name -> label id
    labels: Map<string, string>
}

async function loadRepo(repo: string): Promise<Repo> {
    const [owner, name] = repo.split('/')
    const data = await graphql<{
        repository: {
            id: string
            labels: { nodes: { id: string; name: string }[] }
        }
    }>(
        `
            query ($owner: String!, $name: String!) {
                repository(owner: $owner, name: $name) {
                    id
                    labels(first: 100) {
                        nodes {
                            id
                            name
                        }
                    }
                }
            }
        `,
        { owner, name }
    )
    return {
        id: data.repository.id,
        labels: new Map(
            data.repository.labels.nodes.map((l) => [l.name, l.id])
        ),
    }
}

interface Issue {
    id: string
    number: number
    title: string
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
    states: IssueState[]
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
            { owner, name, states, after, field: PRODUCT_FIELD }
        )

        const page = data.repository.issues
        for (const node of page.nodes) {
            issues.push({
                id: node.id,
                number: node.number,
                title: node.title,
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

async function createLabel(repo: Repo, name: string): Promise<void> {
    const data = await graphql<{ createLabel: { label: { id: string } } }>(
        `
            mutation ($repositoryId: ID!, $name: String!) {
                createLabel(
                    input: {
                        repositoryId: $repositoryId
                        name: $name
                        color: "ededed"
                    }
                ) {
                    label {
                        id
                    }
                }
            }
        `,
        { repositoryId: repo.id, name }
    )
    repo.labels.set(name, data.createLabel.label.id)
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

function line(issue: Issue, note = ''): string {
    const title =
        issue.title.length > 60 ? `${issue.title.slice(0, 57)}...` : issue.title
    const prefix = `  #${String(issue.number).padEnd(5)} `
    return note ? `${prefix}${title.padEnd(60)}  ${note}` : `${prefix}${title}`
}

function describe(action: SyncAction): string {
    switch (action.kind) {
        case 'field':
            return `label -> ${PRODUCT_FIELD} = ${action.option}`
        case 'labels':
            return `${PRODUCT_FIELD} -> ${[
                ...action.add.map((l) => `+${l}`),
                ...action.remove.map((l) => `-${l}`),
            ].join(' ')}`
        case 'conflict':
            return `CONFLICT: ${action.labels.join(', ')} and no ${PRODUCT_FIELD}`
    }
}

void program
    .description(
        "Add project-less issues to the project, and sync product labels with the project's Product field. Runs both steps unless one is selected."
    )
    .option('--no-dry-run', 'Apply the changes (default: dry run)')
    .option('--add-to-project', 'Add issues with no project to the project')
    .option('--sync-labels', `Sync product labels <-> ${PRODUCT_FIELD} field`)
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
        const runAll = !opts.addToProject && !opts.syncLabels
        const doAdd = runAll || !!opts.addToProject
        const doSync = runAll || !!opts.syncLabels

        await checkGh()

        const project = await loadProject(
            opts.projectOwner,
            Number(opts.projectNumber)
        )
        const repo = await loadRepo(opts.repo)
        console.log(
            `Loading ${opts.state} issues from ${opts.repo} (project "${project.title}")...`
        )
        const issues = await loadIssues(opts.repo, states)

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
        const missingLabels = doSync
            ? PRODUCTS.map((p) => p.label).filter((l) => !repo.labels.has(l))
            : []

        if (doAdd) {
            console.log(
                `\n[add-to-project] Add to "${project.title}": ${noProject.length} issue(s)`
            )
            noProject.forEach((i) => console.log(line(i)))
        }
        if (doSync) {
            console.log(
                `\n[sync-labels] ${changes.length} change(s), ${conflicts.length} conflict(s)`
            )
            if (missingLabels.length) {
                console.log(`  create label(s): ${missingLabels.join(', ')}`)
            }
            changes.forEach((a) => console.log(line(a.issue, describe(a))))
            conflicts.forEach((a) => console.log(line(a.issue, describe(a))))
        }

        if (opts.dryRun) {
            console.log(
                '\nDry run: no changes made. Re-run with --no-dry-run to apply.'
            )
            return
        }

        if (noProject.length + changes.length === 0) {
            console.log('\nNothing to do.')
            return
        }

        const proceed = await confirm({
            message: `Apply these changes to ${opts.repo}?`,
            default: false,
        })
        if (!proceed) {
            console.log('Aborting')
            return
        }

        const failures: string[] = []
        const attempt = async (issue: Issue, step: () => Promise<void>) => {
            try {
                await step()
                console.log(`  ok   #${issue.number}`)
            } catch (error) {
                console.log(
                    `  FAIL #${issue.number}: ${(error as Error).message}`
                )
                failures.push(`#${issue.number}`)
            }
        }

        if (noProject.length) {
            console.log(`\n[add-to-project] ${noProject.length} issue(s)...`)
            for (const issue of noProject) {
                await attempt(issue, async () => {
                    await addToProject(project, issue)
                })
            }
        }

        if (changes.length) {
            for (const label of missingLabels) {
                console.log(`Creating label "${label}"...`)
                await createLabel(repo, label)
            }

            console.log(`\n[sync-labels] ${changes.length} issue(s)...`)
            for (const action of changes) {
                await attempt(action.issue, async () => {
                    if (action.kind === 'field') {
                        // Idempotent: returns the existing item if already in the project
                        const itemId = await addToProject(project, action.issue)
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

        if (conflicts.length) {
            console.log(
                `\n${conflicts.length} conflict(s) skipped; set ${PRODUCT_FIELD} on them by hand and re-run.`
            )
        }
        if (failures.length) {
            console.error(
                `\n${failures.length} issue(s) failed: ${failures.join(', ')}. Re-run to retry.`
            )
            process.exit(1)
        }
        console.log('\nDone.')
    })
    .parseAsync(process.argv)
