// Generated from ../../../../Splice/Api/Token/AllocationInstructionV2/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439 from '@daml.js/splice-api-token-allocation-v2-1.0.0';
import * as pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 from '@daml.js/splice-api-token-holding-v2-1.0.0';
import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type AllocationFactory = damlTypes.Interface<'#splice-api-token-allocation-instruction-v2:Splice.Api.Token.AllocationInstructionV2:AllocationFactory'> & AllocationFactoryView
export declare interface AllocationFactoryInterface {
  AllocationFactory_Allocate:
    damlTypes.Choice<AllocationFactory, AllocationFactory_Allocate, AllocationInstructionResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationFactory, undefined>>;
  AllocationFactory_PublicFetch:
    damlTypes.Choice<AllocationFactory, AllocationFactory_PublicFetch, AllocationFactoryView, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationFactory, undefined>>;
  Archive:
    damlTypes.Choice<AllocationFactory, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationFactory, undefined>>;
}
export declare const AllocationFactory:
  damlTypes.InterfaceCompanion<AllocationFactory, undefined, '#splice-api-token-allocation-instruction-v2:Splice.Api.Token.AllocationInstructionV2:AllocationFactory'> &
  damlTypes.FromTemplate<AllocationFactory, unknown> &
  AllocationFactoryInterface

export declare type AllocationInstruction = damlTypes.Interface<'#splice-api-token-allocation-instruction-v2:Splice.Api.Token.AllocationInstructionV2:AllocationInstruction'> & AllocationInstructionView
export declare interface AllocationInstructionInterface {
  AllocationInstruction_Accept:
    damlTypes.Choice<AllocationInstruction, AllocationInstruction_Accept, AllocationInstructionResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationInstruction, undefined>>;
  AllocationInstruction_Withdraw:
    damlTypes.Choice<AllocationInstruction, AllocationInstruction_Withdraw, AllocationInstructionResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationInstruction, undefined>>;
  Archive:
    damlTypes.Choice<AllocationInstruction, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationInstruction, undefined>>;
}
export declare const AllocationInstruction:
  damlTypes.InterfaceCompanion<AllocationInstruction, undefined, '#splice-api-token-allocation-instruction-v2:Splice.Api.Token.AllocationInstructionV2:AllocationInstruction'> &
  damlTypes.FromTemplate<AllocationInstruction, unknown> &
  AllocationInstructionInterface

export declare type AllocationFactoryView = {
  admin: damlTypes.Party,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationFactoryView:
  damlTypes.Serializable<AllocationFactoryView>

export declare type AllocationFactory_Allocate = {
  settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo,
  allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification,
  requestedAt: damlTypes.Time,
  inputHoldingCids: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
  actors: damlTypes.Party[],
}

export declare const AllocationFactory_Allocate:
  damlTypes.Serializable<AllocationFactory_Allocate>

export declare type AllocationFactory_PublicFetch = {
  actors: damlTypes.Party[],
}

export declare const AllocationFactory_PublicFetch:
  damlTypes.Serializable<AllocationFactory_PublicFetch>

export declare type AllocationInstructionAction =
  | { tag: 'AIA_Withdraw'; value: {} }
  | { tag: 'AIA_Accept'; value: {} }
  | { tag: 'AIA_Custom'; value: AllocationInstructionAction.AIA_Custom }


export declare const AllocationInstructionAction:
  damlTypes.Serializable<AllocationInstructionAction> & {
    AIA_Custom: damlTypes.Serializable<AllocationInstructionAction.AIA_Custom>;
  }

export namespace AllocationInstructionAction {
  type AIA_Custom = {
    id: string,
  }
}

export declare type AllocationInstructionResult = {
  output: AllocationInstructionResult_Output,
  authorizerChangeCids: { [key: string]: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[] },
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationInstructionResult:
  damlTypes.Serializable<AllocationInstructionResult>

export declare type AllocationInstructionResult_Output =
  | { tag: 'AllocationInstructionResult_Pending'; value: AllocationInstructionResult_Output.AllocationInstructionResult_Pending }
  | { tag: 'AllocationInstructionResult_Completed'; value: AllocationInstructionResult_Output.AllocationInstructionResult_Completed }
  | { tag: 'AllocationInstructionResult_Failed'; value: {} }


export declare const AllocationInstructionResult_Output:
  damlTypes.Serializable<AllocationInstructionResult_Output> & {
    AllocationInstructionResult_Completed: damlTypes.Serializable<AllocationInstructionResult_Output.AllocationInstructionResult_Completed>;
    AllocationInstructionResult_Pending: damlTypes.Serializable<AllocationInstructionResult_Output.AllocationInstructionResult_Pending>;
  }

export namespace AllocationInstructionResult_Output {
  type AllocationInstructionResult_Completed = {
    allocationCid: damlTypes.ContractId<pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation>,
  }
  type AllocationInstructionResult_Pending = {
    allocationInstructionCid: damlTypes.ContractId<AllocationInstruction>,
  }
}

export declare type AllocationInstructionView = {
  originalInstructionCid: damlTypes.Optional<damlTypes.ContractId<AllocationInstruction>>,
  settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo,
  allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification,
  requestedAt: damlTypes.Time,
  inputHoldingCids: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[],
  expiresAt: damlTypes.Optional<damlTypes.Time>,
  availableActions: damlTypes.Map<AllocationInstructionAction, damlTypes.Party[][]>,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationInstructionView:
  damlTypes.Serializable<AllocationInstructionView>

export declare type AllocationInstruction_Accept = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const AllocationInstruction_Accept:
  damlTypes.Serializable<AllocationInstruction_Accept>

export declare type AllocationInstruction_Withdraw = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const AllocationInstruction_Withdraw:
  damlTypes.Serializable<AllocationInstruction_Withdraw>
