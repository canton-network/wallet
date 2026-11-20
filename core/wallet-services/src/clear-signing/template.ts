// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface TemplateId {
    packageId: string
    moduleName: string
    entityName: string
}

/**
 * The template a descriptor names. This only checks that the three strings are
 * present. `clearSign` validates the rest.
 *
 * @throws Error when `context.template` does not name a template
 */
export function templateIdOf(json: unknown): TemplateId {
    const template = templateOf(json)
    if (!template) {
        throw new Error(
            'descriptor has no template: context.template needs packageId, moduleName and entityName'
        )
    }
    return template
}

function templateOf(json: unknown): TemplateId | undefined {
    if (typeof json !== 'object' || json === null) return undefined
    const context = (json as { context?: unknown }).context
    if (typeof context !== 'object' || context === null) return undefined
    const template = (context as { template?: unknown }).template
    if (typeof template !== 'object' || template === null) return undefined
    const fields = template as Record<string, unknown>
    const packageId = nonEmpty(fields.packageId)
    const moduleName = nonEmpty(fields.moduleName)
    const entityName = nonEmpty(fields.entityName)
    if (!packageId || !moduleName || !entityName) return undefined
    return { packageId, moduleName, entityName }
}

function nonEmpty(value: unknown): string | undefined {
    if (typeof value !== 'string' || value === '') return undefined
    return value
}
