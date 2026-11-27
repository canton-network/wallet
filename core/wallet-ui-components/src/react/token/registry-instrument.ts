// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AssetBody } from '@canton-network/core-token-standard-service'

// From the registry's `/registry/metadata/v1/instruments`, whose spec
// requires `name` and `decimals`. The URL is a string so that it survives
// extension messaging.
export type RegistryInstrument = Omit<AssetBody, 'registryUrl'> & {
    registryUrl: string
    name: string
    decimals: number
}

/** Groups registry instruments by instrument admin party ID. */
export type RegistryInstrumentsByAdmin = ReadonlyMap<
    string,
    readonly RegistryInstrument[]
>
