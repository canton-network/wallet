// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Bounds on what hashing walks: the nodes of a transaction, how deeply they
 * nest and how deeply a value nests. They do not bound decoding, which comes
 * first and needs memory of many times the input's size.
 */
export interface TraversalLimits {
    /** The most nodes the transaction may list */
    maxNodes: number
    /** The deepest nesting of nodes, a root being at depth 1 */
    maxNodeDepth: number
    /** The deepest nesting of a Daml value, the outermost being at depth 1 */
    maxValueDepth: number
}

/** The limits that apply where the options set none */
export const DEFAULT_LIMITS: Readonly<TraversalLimits> = Object.freeze({
    maxNodes: 10_000,
    maxNodeDepth: 100,
    maxValueDepth: 101,
})
