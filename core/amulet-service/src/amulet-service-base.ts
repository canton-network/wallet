// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ScanProxyClient, ScanTypes } from '@canton-network/core-splice-client'
import {
    DisclosedContract,
    ExerciseCommand,
    TokenStandardService,
} from '@canton-network/core-token-standard-service'
import { PartyId } from '@canton-network/core-types'
import Decimal from 'decimal.js'

// TODO: This appears in a couple of places, either move it somewhere more
// central, or as part of the Service class hierarchy
const REQUESTED_AT_SKEW_MS = 60_000

export abstract class AmuletServiceBase {
    constructor(readonly tokenStandard: TokenStandardService) {}

    protected abstract getAmuletRules(): ReturnType<
        ScanProxyClient['getAmuletRules']
    >

    protected abstract getActiveOpenMiningRound(): ReturnType<
        ScanProxyClient['getActiveOpenMiningRound']
    >

    abstract isDevNet(): Promise<boolean>
    abstract getTransferPreApprovalByParty(
        partyId: PartyId
    ): Promise<
        ScanTypes['LookupTransferPreapprovalByPartyResponse']['transfer_preapproval']
    >
    abstract getFeaturedAppsByParty(
        partyId: PartyId
    ): Promise<
        ScanTypes['LookupFeaturedAppRightResponse']['featured_app_right']
    >

    abstract getMemberTrafficStatus(
        domainId: string,
        memberId: string
    ): Promise<ScanTypes['GetMemberTrafficStatusResponse']>

    async buyMemberTraffic(
        dso: PartyId,
        provider: PartyId,
        trafficAmount: number,
        synchronizerId: string,
        memberId: string,
        migrationId: number,
        inputUtxos?: string[]
    ): Promise<[ExerciseCommand, DisclosedContract[]]> {
        const amuletRules = await this.getAmuletRules()
        const activeRound = await this.getActiveOpenMiningRound()

        const inputHoldings = await this.tokenStandard.getInputHoldingsCids(
            provider,
            inputUtxos,
            new Decimal(trafficAmount)
        )

        if (!amuletRules) {
            throw new Error('AmuletRules contract not found')
        }
        if (!activeRound) {
            throw new Error(
                'OpenMiningRound active at current moment not found'
            )
        }

        const disclosed: DisclosedContract[] = [
            {
                templateId: amuletRules.template_id,
                contractId: amuletRules.contract_id,
                createdEventBlob: amuletRules.created_event_blob,
                synchronizerId,
            },
            {
                templateId: activeRound.template_id!,
                contractId: activeRound.contract_id,
                createdEventBlob: activeRound.created_event_blob,
                synchronizerId,
            },
        ]

        const context = {
            openMiningRound: activeRound.contract_id,
            issuingMiningRounds: [],
            validatorRights: [],
            featuredAppRight: null,
        }

        const choiceArgs = {
            context,
            inputs: inputHoldings.map((cid) => ({
                tag: 'InputAmulet',
                value: cid,
            })),
            provider,
            memberId: this.tokenStandard.core.toQualifiedMemberId(memberId),
            synchronizerId,
            migrationId: migrationId.toString(),
            trafficAmount: trafficAmount.toString(),
            expectedDso: dso,
        }

        const exercise: ExerciseCommand = {
            templateId: '#splice-amulet:Splice.AmuletRules:AmuletRules',
            contractId: amuletRules.contract_id,
            choice: 'AmuletRules_BuyMemberTraffic',
            choiceArgument: choiceArgs,
        }

        return [exercise, disclosed]
    }

    async selfGrantFeatureAppRight(
        providerPartyId: PartyId,
        synchronizerId: string
    ): Promise<[ExerciseCommand, DisclosedContract[]]> {
        const amuletRules = await this.getAmuletRules()
        const disclosedContracts = {
            templateId: amuletRules.template_id,
            contractId: amuletRules.contract_id,
            createdEventBlob: amuletRules.created_event_blob,
            synchronizerId,
        }

        return [
            {
                templateId: amuletRules.template_id,
                contractId: amuletRules.contract_id,
                choice: 'AmuletRules_DevNet_FeatureApp',
                choiceArgument: {
                    provider: providerPartyId,
                },
            },
            [disclosedContracts],
        ]
    }

    async cancelTransferPreapproval(
        contractId: string,
        templateId: string,
        actor: PartyId
    ): Promise<[ExerciseCommand, DisclosedContract[]]> {
        const exercise: ExerciseCommand = {
            templateId,
            contractId,
            choice: 'TransferPreapproval_Cancel',
            choiceArgument: { p: actor },
        }
        return [exercise, []]
    }

    async renewTransferPreapproval(
        contractId: string,
        templateId: string,
        provider: PartyId,
        synchronizerId: PartyId,
        newExpiresAt?: Date,
        inputUtxos?: string[]
    ): Promise<[ExerciseCommand, DisclosedContract[]]> {
        const amuletRules = await this.getAmuletRules()
        const activeRound = await this.getActiveOpenMiningRound()

        if (!amuletRules) {
            throw new Error('AmuletRules contract not found')
        }
        if (!activeRound) {
            throw new Error(
                'OpenMiningRound active at current moment not found'
            )
        }

        const disclosed: DisclosedContract[] = [
            {
                templateId: amuletRules.template_id,
                contractId: amuletRules.contract_id,
                createdEventBlob: amuletRules.created_event_blob,
                synchronizerId,
            },
            {
                templateId: activeRound.template_id!,
                contractId: activeRound.contract_id,
                createdEventBlob: activeRound.created_event_blob,
                synchronizerId,
            },
        ]

        const inputHoldings = await this.tokenStandard.getInputHoldingsCids(
            provider,
            inputUtxos
        )

        const context = {
            context: {
                openMiningRound: activeRound.contract_id,
                issuingMiningRounds: [],
                validatorRights: [],
                featuredAppRight: null,
            },
            amuletRules: amuletRules.contract_id,
        }

        // Defaults to 90 days
        const effectiveNewExpiresAt: Date =
            newExpiresAt ?? new Date(Date.now() + 90 * 24 * 3600 * 1000)

        const exercise: ExerciseCommand = {
            templateId,
            contractId,
            choice: 'TransferPreapproval_Renew',
            choiceArgument: {
                context,
                inputs: inputHoldings.map((cid) => ({
                    tag: 'InputAmulet',
                    value: cid,
                })),
                newExpiresAt: effectiveNewExpiresAt.toISOString(),
            },
        }

        return [exercise, disclosed]
    }

    async createTap(
        receiver: string,
        amount: string,
        instrumentAdmin: string, // TODO (#907): replace with registry call
        instrumentId: string,
        registryUrl: string
    ): Promise<[ExerciseCommand, DisclosedContract[]]> {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const choiceArgs = {
            expectedAdmin: instrumentAdmin,
            transfer: {
                sender: instrumentAdmin,
                receiver,
                amount,
                instrumentId: { admin: instrumentAdmin, id: instrumentId },
                lock: null,
                requestedAt: new Date(
                    Date.now() - REQUESTED_AT_SKEW_MS
                ).toISOString(),
                executeBefore: tomorrow.toISOString(),
                inputHoldingCids: [],
                meta: { values: {} },
            },
            extraArgs: {
                context: { values: {} },
                meta: { values: {} },
            },
        }

        const disclosedContracts = (
            await this.tokenStandard.transfer.fetchTransferFactoryChoiceContext(
                registryUrl,
                choiceArgs
            )
        ).choiceContext.disclosedContracts

        const amuletRules = await this.getAmuletRules()
        if (!amuletRules) {
            throw new Error('AmuletRules contract not found')
        }

        const latestOpenMiningRound = await this.getActiveOpenMiningRound()
        if (!latestOpenMiningRound) {
            throw new Error(
                'OpenMiningRound active at current moment not found'
            )
        }

        return [
            {
                templateId: amuletRules.template_id!,
                contractId: amuletRules.contract_id,
                choice: 'AmuletRules_DevNet_Tap',
                choiceArgument: {
                    receiver,
                    amount,
                    openRound: latestOpenMiningRound.contract_id,
                },
            },
            disclosedContracts,
        ]
    }
}
