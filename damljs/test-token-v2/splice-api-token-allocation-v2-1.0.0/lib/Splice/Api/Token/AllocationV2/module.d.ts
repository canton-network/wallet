// Generated from ../../../../Splice/Api/Token/AllocationV2/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 from '@daml.js/splice-api-token-holding-v2-1.0.0';
import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type Allocation = damlTypes.Interface<'#splice-api-token-allocation-v2:Splice.Api.Token.AllocationV2:Allocation'> & AllocationView
export declare interface AllocationInterface {
  Allocation_Cancel:
    damlTypes.Choice<Allocation, Allocation_Cancel, AllocationResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<Allocation, undefined>>;
  Allocation_Settle:
    damlTypes.Choice<Allocation, Allocation_Settle, AllocationResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<Allocation, undefined>>;
  Allocation_Withdraw:
    damlTypes.Choice<Allocation, Allocation_Withdraw, AllocationResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<Allocation, undefined>>;
  Archive:
    damlTypes.Choice<Allocation, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<Allocation, undefined>>;
}
export declare const Allocation:
  damlTypes.InterfaceCompanion<Allocation, undefined, '#splice-api-token-allocation-v2:Splice.Api.Token.AllocationV2:Allocation'> &
  damlTypes.FromTemplate<Allocation, unknown> &
  AllocationInterface

export declare type SettlementFactory = damlTypes.Interface<'#splice-api-token-allocation-v2:Splice.Api.Token.AllocationV2:SettlementFactory'> & SettlementFactoryView
export declare interface SettlementFactoryInterface {
  Archive:
    damlTypes.Choice<SettlementFactory, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<SettlementFactory, undefined>>;
  SettlementFactory_PublicFetch:
    damlTypes.Choice<SettlementFactory, SettlementFactory_PublicFetch, SettlementFactoryView, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<SettlementFactory, undefined>>;
  SettlementFactory_SettleBatch:
    damlTypes.Choice<SettlementFactory, SettlementFactory_SettleBatch, SettlementFactory_SettleBatchResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<SettlementFactory, undefined>>;
}
export declare const SettlementFactory:
  damlTypes.InterfaceCompanion<SettlementFactory, undefined, '#splice-api-token-allocation-v2:Splice.Api.Token.AllocationV2:SettlementFactory'> &
  damlTypes.FromTemplate<SettlementFactory, unknown> &
  SettlementFactoryInterface

export declare type AllocationAction =
  | { tag: 'AA_Settle'; value: {} }
  | { tag: 'AA_Cancel'; value: {} }
  | { tag: 'AA_Withdraw'; value: {} }
  | { tag: 'AA_Custom'; value: AllocationAction.AA_Custom }


export declare const AllocationAction:
  damlTypes.Serializable<AllocationAction> & {
    AA_Custom: damlTypes.Serializable<AllocationAction.AA_Custom>;
  }

export namespace AllocationAction {
  type AA_Custom = {
    id: string,
  }
}

export declare type AllocationResult = {
  output: AllocationResult_Output,
  authorizerHoldingCids: { [key: string]: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[] },
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationResult:
  damlTypes.Serializable<AllocationResult>

export declare type AllocationResult_Output =
  | { tag: 'AllocationResult_Pending'; value: AllocationResult_Output.AllocationResult_Pending }
  | { tag: 'AllocationResult_Settled'; value: AllocationResult_Output.AllocationResult_Settled }
  | { tag: 'AllocationResult_Cancelled'; value: {} }
  | { tag: 'AllocationResult_Withdrawn'; value: {} }


export declare const AllocationResult_Output:
  damlTypes.Serializable<AllocationResult_Output> & {
    AllocationResult_Pending: damlTypes.Serializable<AllocationResult_Output.AllocationResult_Pending>;
    AllocationResult_Settled: damlTypes.Serializable<AllocationResult_Output.AllocationResult_Settled>;
  }

export namespace AllocationResult_Output {
  type AllocationResult_Pending = {
    allocationCid: damlTypes.ContractId<Allocation>,
  }
  type AllocationResult_Settled = {
    nextIterationAllocationCid: damlTypes.Optional<damlTypes.ContractId<Allocation>>,
  }
}

export declare type AllocationSpecification = {
  admin: damlTypes.Party,
  authorizer: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  transferLegSides: TransferLegSide[],
  settlementDeadline: damlTypes.Optional<damlTypes.Time>,
  nextIterationFunding: damlTypes.Optional<{ [key: string]: damlTypes.Numeric }>,
  committed: boolean,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationSpecification:
  damlTypes.Serializable<AllocationSpecification>

export declare type AllocationView = {
  originalAllocationCid: damlTypes.Optional<damlTypes.ContractId<Allocation>>,
  settlement: SettlementInfo,
  allocation: AllocationSpecification,
  holdingCids: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[],
  createdAt: damlTypes.Time,
  numIterations: damlTypes.Int,
  expiresAt: damlTypes.Optional<damlTypes.Time>,
  availableActions: damlTypes.Map<AllocationAction, damlTypes.Party[][]>,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationView:
  damlTypes.Serializable<AllocationView>

export declare type Allocation_Cancel = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const Allocation_Cancel:
  damlTypes.Serializable<Allocation_Cancel>

export declare type Allocation_Settle = {
  actors: damlTypes.Party[],
  extraTransferLegSides: TransferLegSide[],
  nextIterationFunding: damlTypes.Optional<{ [key: string]: damlTypes.Numeric }>,
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const Allocation_Settle:
  damlTypes.Serializable<Allocation_Settle>

export declare type Allocation_Withdraw = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const Allocation_Withdraw:
  damlTypes.Serializable<Allocation_Withdraw>

export declare type FinalizedAllocation = {
  allocationCid: damlTypes.ContractId<Allocation>,
  extraTransferLegSides: TransferLegSide[],
  nextIterationFunding: damlTypes.Optional<{ [key: string]: damlTypes.Numeric }>,
}

export declare const FinalizedAllocation:
  damlTypes.Serializable<FinalizedAllocation>

export declare type SettlementFactoryView = {
  admin: damlTypes.Party,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const SettlementFactoryView:
  damlTypes.Serializable<SettlementFactoryView>

export declare type SettlementFactory_PublicFetch = {
  actors: damlTypes.Party[],
}

export declare const SettlementFactory_PublicFetch:
  damlTypes.Serializable<SettlementFactory_PublicFetch>

export declare type SettlementFactory_SettleBatch = {
  settlement: SettlementInfo,
  transferLegs: TransferLeg[],
  allocations: FinalizedAllocation[],
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const SettlementFactory_SettleBatch:
  damlTypes.Serializable<SettlementFactory_SettleBatch>

export declare type SettlementFactory_SettleBatchResult = {
  allocationSettleResults: AllocationResult[],
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const SettlementFactory_SettleBatchResult:
  damlTypes.Serializable<SettlementFactory_SettleBatchResult>

export declare type SettlementInfo = {
  executors: damlTypes.Party[],
  id: string,
  cid: damlTypes.Optional<damlTypes.ContractId<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.AnyContract>>,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const SettlementInfo:
  damlTypes.Serializable<SettlementInfo>

export declare type TransferLeg = {
  transferLegId: string,
  sender: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  receiver: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  amount: damlTypes.Numeric,
  instrumentId: string,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const TransferLeg:
  damlTypes.Serializable<TransferLeg>

export declare type TransferLegSide = {
  transferLegId: string,
  side: TransferSide,
  otherside: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  amount: damlTypes.Numeric,
  instrumentId: string,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const TransferLegSide:
  damlTypes.Serializable<TransferLegSide>

export declare type TransferSide =
  | 'SenderSide'
  | 'ReceiverSide'


export declare const TransferSide:
  damlTypes.Serializable<TransferSide> & { readonly keys: TransferSide[] } & { readonly [e in TransferSide]: e }
