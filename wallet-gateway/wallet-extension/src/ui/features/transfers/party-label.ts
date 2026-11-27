// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** A transfer's sender or receiver; `''` is a v2 account with no owner party. */
export function partyLabel(party: string): string {
    return party === '' ? 'an account with no owner party' : party
}
