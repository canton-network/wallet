// Generated from ../../../../Splice/Api/Token/TransferInstructionV2/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 from '@daml.js/splice-api-token-holding-v2-1.0.0';
import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type TransferFactory = damlTypes.Interface<'#splice-api-token-transfer-instruction-v2:Splice.Api.Token.TransferInstructionV2:TransferFactory'> & TransferFactoryView
export declare interface TransferFactoryInterface {
  Archive:
    damlTypes.Choice<TransferFactory, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<TransferFactory, undefined>>;
  TransferFactory_PublicFetch:
    damlTypes.Choice<TransferFactory, TransferFactory_PublicFetch, TransferFactoryView, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<TransferFactory, undefined>>;
  TransferFactory_Transfer:
    damlTypes.Choice<TransferFactory, TransferFactory_Transfer, TransferInstructionResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<TransferFactory, undefined>>;
}
export declare const TransferFactory:
  damlTypes.InterfaceCompanion<TransferFactory, undefined, '#splice-api-token-transfer-instruction-v2:Splice.Api.Token.TransferInstructionV2:TransferFactory'> &
  damlTypes.FromTemplate<TransferFactory, unknown> &
  TransferFactoryInterface

export declare type TransferInstruction = damlTypes.Interface<'#splice-api-token-transfer-instruction-v2:Splice.Api.Token.TransferInstructionV2:TransferInstruction'> & TransferInstructionView
export declare interface TransferInstructionInterface {
  Archive:
    damlTypes.Choice<TransferInstruction, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<TransferInstruction, undefined>>;
  TransferInstruction_Accept:
    damlTypes.Choice<TransferInstruction, TransferInstruction_Accept, TransferInstructionResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<TransferInstruction, undefined>>;
  TransferInstruction_Reject:
    damlTypes.Choice<TransferInstruction, TransferInstruction_Reject, TransferInstructionResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<TransferInstruction, undefined>>;
  TransferInstruction_Withdraw:
    damlTypes.Choice<TransferInstruction, TransferInstruction_Withdraw, TransferInstructionResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<TransferInstruction, undefined>>;
}
export declare const TransferInstruction:
  damlTypes.InterfaceCompanion<TransferInstruction, undefined, '#splice-api-token-transfer-instruction-v2:Splice.Api.Token.TransferInstructionV2:TransferInstruction'> &
  damlTypes.FromTemplate<TransferInstruction, unknown> &
  TransferInstructionInterface

export declare type Transfer = {
  sender: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  receiver: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  amount: damlTypes.Numeric,
  instrumentId: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.InstrumentId,
  requestedAt: damlTypes.Time,
  executeBefore: damlTypes.Time,
  inputHoldingCids: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[],
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const Transfer:
  damlTypes.Serializable<Transfer>

export declare type TransferFactoryView = {
  admin: damlTypes.Party,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const TransferFactoryView:
  damlTypes.Serializable<TransferFactoryView>

export declare type TransferFactory_PublicFetch = {
  actors: damlTypes.Party[],
}

export declare const TransferFactory_PublicFetch:
  damlTypes.Serializable<TransferFactory_PublicFetch>

export declare type TransferFactory_Transfer = {
  transfer: Transfer,
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const TransferFactory_Transfer:
  damlTypes.Serializable<TransferFactory_Transfer>

export declare type TransferInstructionAction =
  | { tag: 'TIA_Accept'; value: {} }
  | { tag: 'TIA_Reject'; value: {} }
  | { tag: 'TIA_Withdraw'; value: {} }
  | { tag: 'TIA_Custom'; value: TransferInstructionAction.TIA_Custom }


export declare const TransferInstructionAction:
  damlTypes.Serializable<TransferInstructionAction> & {
    TIA_Custom: damlTypes.Serializable<TransferInstructionAction.TIA_Custom>;
  }

export namespace TransferInstructionAction {
  type TIA_Custom = {
    id: string,
  }
}

export declare type TransferInstructionResult = {
  output: TransferInstructionResult_Output,
  senderChangeCids: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[],
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const TransferInstructionResult:
  damlTypes.Serializable<TransferInstructionResult>

export declare type TransferInstructionResult_Output =
  | { tag: 'TransferInstructionResult_Pending'; value: TransferInstructionResult_Output.TransferInstructionResult_Pending }
  | { tag: 'TransferInstructionResult_Completed'; value: TransferInstructionResult_Output.TransferInstructionResult_Completed }
  | { tag: 'TransferInstructionResult_Failed'; value: {} }


export declare const TransferInstructionResult_Output:
  damlTypes.Serializable<TransferInstructionResult_Output> & {
    TransferInstructionResult_Completed: damlTypes.Serializable<TransferInstructionResult_Output.TransferInstructionResult_Completed>;
    TransferInstructionResult_Pending: damlTypes.Serializable<TransferInstructionResult_Output.TransferInstructionResult_Pending>;
  }

export namespace TransferInstructionResult_Output {
  type TransferInstructionResult_Completed = {
    receiverHoldingCids: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[],
  }
  type TransferInstructionResult_Pending = {
    transferInstructionCid: damlTypes.ContractId<TransferInstruction>,
  }
}

export declare type TransferInstructionView = {
  originalInstructionCid: damlTypes.Optional<damlTypes.ContractId<TransferInstruction>>,
  transfer: Transfer,
  expiresAt: damlTypes.Optional<damlTypes.Time>,
  availableActions: damlTypes.Map<TransferInstructionAction, damlTypes.Party[][]>,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const TransferInstructionView:
  damlTypes.Serializable<TransferInstructionView>

export declare type TransferInstruction_Accept = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const TransferInstruction_Accept:
  damlTypes.Serializable<TransferInstruction_Accept>

export declare type TransferInstruction_Reject = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const TransferInstruction_Reject:
  damlTypes.Serializable<TransferInstruction_Reject>

export declare type TransferInstruction_Withdraw = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const TransferInstruction_Withdraw:
  damlTypes.Serializable<TransferInstruction_Withdraw>
