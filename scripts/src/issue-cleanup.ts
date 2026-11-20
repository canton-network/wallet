// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// One-off GitHub issue cleanup. Dry run by default; pass --no-dry-run to apply.
//
//  1. Issues that belong to no project (`no:project`) are added to the project.
//  2. Issues labelled `wallet-gateway` get the project's "Product" field set to
//     "Wallet Gateway", and the label is removed.
//
// Uses the `gh` CLI, which authenticates with `GH_TOKEN` when it is set. The token
// needs the `repo` and `project` scopes (classic) or Issues + Projects write
// access (fine-grained).

import { spawn } from 'child_process'

import { program } from '@commander-js/extra-typings'
import { confirm } from '@inquirer/prompts'

const LABEL = 'wallet-gateway'
const PRODUCT_FIELD = 'Product'
const PRODUCT_VALUE = 'Wallet Gateway'

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
    productOptionId: string
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
    const option = project.field.options.find((o) => o.name === PRODUCT_VALUE)
    if (!option) {
        const names = project.field.options.map((o) => o.name).join(', ')
        throw new Error(
            `Field "${PRODUCT_FIELD}" has no option "${PRODUCT_VALUE}" (options: ${names})`
        )
    }

    return {
        id: project.id,
        title: project.title,
        productFieldId: project.field.id,
        productOptionId: option.id,
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

async function setProduct(project: Project, itemId: string): Promise<void> {
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
            optionId: project.productOptionId,
        }
    )
}

async function removeLabel(issue: Issue, labelId: string): Promise<void> {
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
        { labelableId: issue.id, labelIds: [labelId] }
    )
}

function line(issue: Issue, note = ''): string {
    const title =
        issue.title.length > 70 ? `${issue.title.slice(0, 67)}...` : issue.title
    return `  #${String(issue.number).padEnd(5)} ${title}${note ? `  (${note})` : ''}`
}

void program
    .description(
        `Add project-less issues to the project, and move the "${LABEL}" label into the project's ${PRODUCT_FIELD} field.`
    )
    .option('--no-dry-run', 'Apply the changes (default: dry run)')
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

        await checkGh()

        const project = await loadProject(
            opts.projectOwner,
            Number(opts.projectNumber)
        )
        console.log(
            `Loading ${opts.state} issues from ${opts.repo} (project "${project.title}")...`
        )
        const issues = await loadIssues(opts.repo, states)

        const noProject = issues.filter((i) => i.projectItems.length === 0)
        const labelled = issues.filter((i) =>
            i.labels.some((l) => l.name === LABEL)
        )

        console.log(
            `\n[1] Add to "${project.title}" (no project): ${noProject.length} issue(s)`
        )
        noProject.forEach((i) => console.log(line(i)))

        console.log(
            `\n[2] Remove "${LABEL}" label, set ${PRODUCT_FIELD} = "${PRODUCT_VALUE}": ${labelled.length} issue(s)`
        )
        labelled.forEach((i) => {
            const item = i.projectItems.find((p) => p.project.id === project.id)
            const current = item
                ? (item.product?.name ?? 'unset')
                : 'not in project'
            console.log(line(i, `${PRODUCT_FIELD}: ${current}`))
        })

        if (opts.dryRun) {
            console.log(
                '\nDry run: no changes made. Re-run with --no-dry-run to apply.'
            )
            return
        }

        if (noProject.length + labelled.length === 0) {
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

        console.log(
            `\n[1] Adding ${noProject.length} issue(s) to the project...`
        )
        for (const issue of noProject) {
            await attempt(issue, async () => {
                await addToProject(project, issue)
            })
        }

        console.log(`\n[2] Updating ${labelled.length} "${LABEL}" issue(s)...`)
        for (const issue of labelled) {
            await attempt(issue, async () => {
                // Idempotent: returns the existing item if already in the project
                const itemId = await addToProject(project, issue)
                await setProduct(project, itemId)
                // Removed last, so a failed issue keeps the label and a re-run retries it
                const label = issue.labels.find((l) => l.name === LABEL)!
                await removeLabel(issue, label.id)
            })
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
