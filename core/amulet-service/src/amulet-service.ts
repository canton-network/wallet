// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ScanClient, ScanProxyClient } from '@canton-network/core-splice-client'
import { TokenStandardService } from '@canton-network/core-token-standard-service'
import { AmuletServiceScanOnly } from './amulet-service-scan.js'
import { AmuletServiceScanProxy } from './amulet-service-scan-proxy.js'
import { AmuletServiceBase } from './amulet-service-base.js'

export class AmuletService {
    private readonly serviceImpl: AmuletServiceBase

    constructor(tokenStandard: TokenStandardService, scanClient: ScanClient)
    /** @deprecated use scanClient only */
    constructor(
        tokenStandard: TokenStandardService,
        scanProxyClient: ScanProxyClient
    )
    /** @deprecated use scanClient only */
    constructor(
        tokenStandard: TokenStandardService,
        scanProxyClient: ScanProxyClient,
        scanClient: ScanClient | undefined
    )
    constructor(
        tokenStandard: TokenStandardService,
        arg1: ScanProxyClient | ScanClient,
        arg2?: ScanClient
    ) {
        this.serviceImpl = isScanClient(arg1)
            ? new AmuletServiceScanOnly(tokenStandard, arg1)
            : new AmuletServiceScanProxy(tokenStandard, arg1, arg2)
    }

    async buyMemberTraffic(
        ...args: Parameters<AmuletServiceBase['buyMemberTraffic']>
    ) {
        return this.serviceImpl.buyMemberTraffic(...args)
    }

    async createTap(...args: Parameters<AmuletServiceBase['createTap']>) {
        return this.serviceImpl.createTap(...args)
    }

    async cancelTransferPreapproval(
        ...args: Parameters<AmuletServiceBase['cancelTransferPreapproval']>
    ) {
        return this.serviceImpl.cancelTransferPreapproval(...args)
    }

    async renewTransferPreapproval(
        ...args: Parameters<AmuletServiceBase['renewTransferPreapproval']>
    ) {
        return this.serviceImpl.renewTransferPreapproval(...args)
    }

    async getFeaturedAppsByParty(
        ...args: Parameters<AmuletServiceBase['getFeaturedAppsByParty']>
    ) {
        return this.serviceImpl.getFeaturedAppsByParty(...args)
    }

    async getTransferPreApprovalByParty(
        ...args: Parameters<AmuletServiceBase['getTransferPreApprovalByParty']>
    ) {
        return this.serviceImpl.getTransferPreApprovalByParty(...args)
    }

    async selfGrantFeatureAppRight(
        ...args: Parameters<AmuletServiceBase['selfGrantFeatureAppRight']>
    ) {
        return this.serviceImpl.selfGrantFeatureAppRight(...args)
    }

    async isDevNet(...args: Parameters<AmuletServiceBase['isDevNet']>) {
        return this.serviceImpl.isDevNet(...args)
    }

    async getMemberTrafficStatus(
        ...args: Parameters<AmuletServiceBase['getMemberTrafficStatus']>
    ) {
        return this.serviceImpl.getMemberTrafficStatus(...args)
    }
}

function isScanClient(x: ScanProxyClient | ScanClient): x is ScanClient {
    return x instanceof ScanClient
}
