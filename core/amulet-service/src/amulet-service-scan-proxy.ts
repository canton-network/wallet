// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartyId } from '@canton-network/core-types'
import {
    ScanClient,
    ScanProxyClient,
    ScanProxyTypes,
} from '@canton-network/core-splice-client'
import { TokenStandardService } from '@canton-network/core-token-standard-service'

import { AmuletServiceBase } from './amulet-service-base'

/** AmuletService extends TokenStandardService to provide features that are
 *  available for amulet but not in the token standard, such as:
 *
 *   - Tapping
 *   - Transfer preapprovals
 *   - Featured apps
 */
export class AmuletServiceScanProxy extends AmuletServiceBase {
    constructor(
        readonly tokenStandard: TokenStandardService,
        private readonly scanProxyClient: ScanProxyClient,
        private readonly scanClient: ScanClient | undefined
    ) {
        super(tokenStandard)
    }

    protected getAmuletRules(): ReturnType<ScanProxyClient['getAmuletRules']> {
        return this.scanProxyClient.getAmuletRules()
    }

    protected getActiveOpenMiningRound(): ReturnType<
        ScanProxyClient['getActiveOpenMiningRound']
    > {
        return this.scanProxyClient.getActiveOpenMiningRound()
    }
    async isDevNet(): Promise<boolean> {
        return await this.scanProxyClient.isDevNet()
    }
    async getTransferPreApprovalByParty(
        partyId: PartyId
    ): Promise<
        ScanProxyTypes['LookupTransferPreapprovalByPartyResponse']['transfer_preapproval']
    > {
        const { transfer_preapproval } = await this.scanProxyClient.get(
            '/v0/scan-proxy/transfer-preapprovals/by-party/{party}',
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
        ScanProxyTypes['LookupFeaturedAppRightResponse']['featured_app_right']
    > {
        const { featured_app_right } = await this.scanProxyClient.get(
            '/v0/scan-proxy/featured-apps/{provider_party_id}',
            {
                path: {
                    provider_party_id: partyId,
                },
            }
        )
        return featured_app_right
    }

    async getMemberTrafficStatus(domainId: string, memberId: string) {
        if (!this.scanClient) {
            throw new Error('Scan API URL was not provided')
        }
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
