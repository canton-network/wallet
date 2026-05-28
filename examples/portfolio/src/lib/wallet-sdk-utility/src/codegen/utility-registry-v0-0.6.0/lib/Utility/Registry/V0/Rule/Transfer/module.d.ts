// Generated from Utility/Registry/V0/Rule/Transfer.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 from '@daml.js/splice-api-token-transfer-instruction-v1-1.0.0';
import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda from '@daml.js/splice-api-featured-app-v1-1.0.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d from '@daml.js/splice-api-token-allocation-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Registry_V0_Configuration_AppReward from '../../../../../Utility/Registry/V0/Configuration/AppReward/module';
import * as Utility_Registry_V0_Configuration_Instrument from '../../../../../Utility/Registry/V0/Configuration/Instrument/module';

export declare type ExpectedInputHoldingLockState =
  | 'ExpectedUnlocked'
  | 'ExpectedLocked'
;

export declare const ExpectedInputHoldingLockState:
  damlTypes.Serializable<ExpectedInputHoldingLockState> & {
  }
& { readonly keys: ExpectedInputHoldingLockState[] } & { readonly [e in ExpectedInputHoldingLockState]: e }
;


export declare type TransferRule_Transfer_Result = {
  receiverHoldingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  senderChangeCid: damlTypes.Optional<damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>>;
};

export declare const TransferRule_Transfer_Result:
  damlTypes.Serializable<TransferRule_Transfer_Result> & {
  }
;


export declare type TransferRule_ExecuteAllocation_Result = {
  receiverHoldingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  senderHoldingCid: damlTypes.Optional<damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>>;
};

export declare const TransferRule_ExecuteAllocation_Result:
  damlTypes.Serializable<TransferRule_ExecuteAllocation_Result> & {
  }
;


export declare type TransferRule_AcceptTransferOffer_Result = {
  receiverHoldingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  senderHoldingCid: damlTypes.Optional<damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>>;
};

export declare const TransferRule_AcceptTransferOffer_Result:
  damlTypes.Serializable<TransferRule_AcceptTransferOffer_Result> & {
  }
;


export declare type TransferRule_DirectTransfer_Result = {
  receiverHoldingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  senderHoldingCid: damlTypes.Optional<damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>>;
};

export declare const TransferRule_DirectTransfer_Result:
  damlTypes.Serializable<TransferRule_DirectTransfer_Result> & {
  }
;


export declare type TransferRule_Transfer = {
  transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer;
  instrumentConfigurationCid: damlTypes.ContractId<Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration>;
  senderCredentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
  receiverCredentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
  appRewardConfigurationCid: damlTypes.Optional<damlTypes.ContractId<Utility_Registry_V0_Configuration_AppReward.AppRewardConfiguration>>;
  featuredAppRightCid: damlTypes.Optional<damlTypes.ContractId<pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppRight>>;
};

export declare const TransferRule_Transfer:
  damlTypes.Serializable<TransferRule_Transfer> & {
  }
;


export declare type TransferRule_ExecuteAllocation = {
  allocation: pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.AllocationView;
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
  expectedOperator: damlTypes.Party;
  expectedProvider: damlTypes.Party;
};

export declare const TransferRule_ExecuteAllocation:
  damlTypes.Serializable<TransferRule_ExecuteAllocation> & {
  }
;


export declare type TransferRule_TwoStepTransfer = {
  transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer;
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
  expectedOperator: damlTypes.Party;
  expectedProvider: damlTypes.Party;
};

export declare const TransferRule_TwoStepTransfer:
  damlTypes.Serializable<TransferRule_TwoStepTransfer> & {
  }
;


export declare type TransferRule_DirectTransfer = {
  transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer;
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
  expectedOperator: damlTypes.Party;
  expectedProvider: damlTypes.Optional<damlTypes.Party>;
};

export declare const TransferRule_DirectTransfer:
  damlTypes.Serializable<TransferRule_DirectTransfer> & {
  }
;


export declare type TransferRule = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
};

export declare interface TransferRuleInterface {
  TransferRule_DirectTransfer: damlTypes.Choice<TransferRule, TransferRule_DirectTransfer, TransferRule_DirectTransfer_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRule, undefined>>;
  TransferRule_TwoStepTransfer: damlTypes.Choice<TransferRule, TransferRule_TwoStepTransfer, TransferRule_AcceptTransferOffer_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRule, undefined>>;
  TransferRule_ExecuteAllocation: damlTypes.Choice<TransferRule, TransferRule_ExecuteAllocation, TransferRule_ExecuteAllocation_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRule, undefined>>;
  Archive: damlTypes.Choice<TransferRule, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRule, undefined>>;
  TransferRule_Transfer: damlTypes.Choice<TransferRule, TransferRule_Transfer, TransferRule_Transfer_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRule, undefined>>;
}
export declare const TransferRule:
  damlTypes.Template<TransferRule, undefined, '#utility-registry-v0:Utility.Registry.V0.Rule.Transfer:TransferRule'> &
  damlTypes.ToInterface<TransferRule, never> &
  TransferRuleInterface;

export declare namespace TransferRule {
}


