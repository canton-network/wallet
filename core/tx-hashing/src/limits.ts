// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Limits on the decoded transaction; they do not bound decoding itself. */
export interface TraversalLimits {
    maxNodes: number
    /** Levels of nodes, a root at level 1 */
    maxNodeDepth: number
    /** Levels of a value, the outermost at level 1 */
    maxValueDepth: number
}

export const DEFAULT_LIMITS: Readonly<TraversalLimits> = Object.freeze({
    maxNodes: 10_000,
    maxNodeDepth: 100,
    maxValueDepth: 101,
})
