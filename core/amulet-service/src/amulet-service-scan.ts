// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    ScanClient,
    ScanProxyClient,
    ScanTypes,
} from '@canton-network/core-splice-client'
import { TokenStandardService } from '@canton-network/core-token-standard-service'
import { PartyId } from '@canton-network/core-types'
import { AmuletServiceBase } from './amulet-service-base'

export class AmuletServiceScanOnly extends AmuletServiceBase {
    constructor(
        readonly tokenStandard: TokenStandardService,
        private readonly scanClient: ScanClient
    ) {
        super(tokenStandard)
    }
    protected async getAmuletRules(): ReturnType<
        ScanProxyClient['getAmuletRules']
    > {
        const amuletRules = await this.scanClient.getAmuletRules()

        if (!amuletRules) {
            throw new Error('AmuletRules contract not found')
        }
        return amuletRules
    }

    protected async getActiveOpenMiningRound(): ReturnType<
        ScanProxyClient['getActiveOpenMiningRound']
    > {
        return await this.scanClient.getActiveOpenMiningRound()
    }
    async isDevNet(): Promise<boolean> {
        return await this.scanClient.isDevNet()
    }
    async getTransferPreApprovalByParty(
        partyId: PartyId
    ): Promise<
        ScanTypes['LookupTransferPreapprovalByPartyResponse']['transfer_preapproval']
    > {
        const { transfer_preapproval } = await this.scanClient.get(
            '/v0/transfer-preapprovals/by-party/{party}',
            {
                path: {
                    party: partyId,
                },
            }
        )

        return transfer_preapproval
    }
    async getFeaturedAppsByParty(
        partyId: PartyId
    ): Promise<
        ScanTypes['LookupFeaturedAppRightResponse']['featured_app_right']
    > {
        const { featured_app_right } = await this.scanClient.get(
            '/v0/featured-apps/{provider_party_id}',
            {
                path: {
                    provider_party_id: partyId,
                },
            }
        )
        return featured_app_right
    }

    async getMemberTrafficStatus(domainId: string, memberId: string) {
        return this.scanClient.get(
            '/v0/domains/{domain_id}/members/{member_id}/traffic-status',
            {
                path: {
                    domain_id: domainId,
                    member_id:
                        this.tokenStandard.core.toQualifiedMemberId(memberId),
                },
            }
        )
    }
}
