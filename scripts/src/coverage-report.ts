// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getArgValue, getRepoRoot } from './lib/utils.js'

interface CoverageMetric {
    total: number
    covered: number
    pct: number
}

interface CoverageSummary {
    total: {
        lines: CoverageMetric
    }
}

interface NxProject {
    root: string
}

interface CoverageReportConfig {
    excludedProjects?: string[]
}

type CoverageResult =
    | {
          status: 'measured'
          linesPct: number
          linesTotal: number
          linesCovered: number
      }
    | { status: 'excluded' }
    | { status: 'missing' }

interface PackageCoverage {
    name: string
    result: CoverageResult
}

const repoRoot = getRepoRoot()
const base = getArgValue('base')
const head = getArgValue('head')

const coverageReportConfigPath = join(
    repoRoot,
    'scripts/src/coverage-report.config.json'
)
const centrallyExcludedProjects = new Set<string>(
    existsSync(coverageReportConfigPath)
        ? ((
              JSON.parse(
                  readFileSync(coverageReportConfigPath, 'utf8')
              ) as CoverageReportConfig
          ).excludedProjects ?? [])
        : []
)

function nxJson(command: string): unknown {
    const stdout = execSync(`yarn ${command}`, {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
    })
    return JSON.parse(stdout)
}

function getProjects(): string[] {
    let command = 'nx show projects --with-target=test:coverage --json'
    if (base && head) {
        command += ` --affected --base=${base} --head=${head}`
    }
    return nxJson(command) as string[]
}

function getProjectRoot(projectName: string): string {
    const project = nxJson(`nx show project ${projectName} --json`) as NxProject
    return project.root
}

function isCoverageExcluded(projectName: string): boolean {
    return centrallyExcludedProjects.has(projectName)
}

function readLineCoverage(
    projectName: string,
    projectRoot: string
): CoverageResult {
    if (isCoverageExcluded(projectName)) {
        return { status: 'excluded' }
    }

    const summaryPath = join(
        repoRoot,
        projectRoot,
        'coverage',
        'coverage-summary.json'
    )
    if (!existsSync(summaryPath)) {
        return { status: 'missing' }
    }

    const summary = JSON.parse(
        readFileSync(summaryPath, 'utf8')
    ) as CoverageSummary
    const lines = summary.total.lines
    return {
        status: 'measured',
        linesPct: lines.pct,
        linesTotal: lines.total,
        linesCovered: lines.covered,
    }
}

function formatCoverage(result: CoverageResult): string {
    switch (result.status) {
        case 'measured':
            return `${result.linesPct.toFixed(2)}%`
        case 'excluded':
            return 'N/A'
        case 'missing':
            return 'No coverage info'
    }
}

function printReport(entries: PackageCoverage[]): void {
    const nameWidth = Math.max(
        7,
        ...entries.map((entry) => entry.name.length),
        'Package'.length
    )
    const coverageWidth = Math.max('Coverage'.length, 8)
    const divider = '-'.repeat(nameWidth + coverageWidth + 3)

    console.log('')
    console.log('Unit test coverage summary')
    console.log(divider)
    console.log(
        `${'Package'.padEnd(nameWidth)} | ${'Coverage'.padStart(coverageWidth)}`
    )
    console.log(divider)

    for (const entry of entries) {
        console.log(
            `${entry.name.padEnd(nameWidth)} | ${formatCoverage(entry.result).padStart(coverageWidth)}`
        )
    }

    const measured = entries.flatMap((entry) =>
        entry.result.status === 'measured' ? [entry.result] : []
    )
    if (measured.length > 0) {
        const totalLines = measured.reduce(
            (sum, result) => sum + result.linesTotal,
            0
        )
        const coveredLines = measured.reduce(
            (sum, result) => sum + result.linesCovered,
            0
        )
        const totalPct = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
        console.log(divider)
        console.log(
            `${'Total'.padEnd(nameWidth)} | ${`${totalPct.toFixed(2)}%`.padStart(coverageWidth)}`
        )
    }

    console.log(divider)
    console.log('')
}

const projects = getProjects()
if (projects.length === 0) {
    console.log('No packages with test:coverage target to report.')
    process.exit(0)
}

const entries: PackageCoverage[] = projects
    .map((name) => {
        const projectRoot = getProjectRoot(name)
        return {
            name,
            result: readLineCoverage(name, projectRoot),
        }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

const missing = entries.filter((entry) => entry.result.status === 'missing')
if (missing.length > 0) {
    console.warn(
        `Coverage summary missing for ${missing.length} package(s): ${missing.map((entry) => entry.name).join(', ')}`
    )
}

printReport(entries)
