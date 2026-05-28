// Generated from Splice/ExternalPartyAmuletRules.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520 from '@daml.js/splice-api-token-allocation-instruction-v1-1.0.0';
import * as pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 from '@daml.js/splice-api-token-transfer-instruction-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Splice_AmuletRules from '../../Splice/AmuletRules/module';

export declare type TransferCommand_ExpireResult = {
  sender: damlTypes.Party;
  nonce: damlTypes.Int;
};

export declare const TransferCommand_ExpireResult:
  damlTypes.Serializable<TransferCommand_ExpireResult> & {
  }
;


export declare type TransferCommand_WithdrawResult = {
  sender: damlTypes.Party;
  nonce: damlTypes.Int;
};

export declare const TransferCommand_WithdrawResult:
  damlTypes.Serializable<TransferCommand_WithdrawResult> & {
  }
;


export declare type TransferCommandResult =
  |  { tag: 'TransferCommandResultFailure'; value: TransferCommandResult.TransferCommandResultFailure }
  |  { tag: 'TransferCommandResultSuccess'; value: TransferCommandResult.TransferCommandResultSuccess }
;

export declare const TransferCommandResult:
  damlTypes.Serializable<TransferCommandResult> & {
  TransferCommandResultFailure: damlTypes.Serializable<TransferCommandResult.TransferCommandResultFailure>;
  TransferCommandResultSuccess: damlTypes.Serializable<TransferCommandResult.TransferCommandResultSuccess>;
  }
;


export namespace TransferCommandResult {
  type TransferCommandResultFailure = {
    reason: Splice_AmuletRules.InvalidTransferReason;
  };
} //namespace TransferCommandResult


export namespace TransferCommandResult {
  type TransferCommandResultSuccess = {
    result: Splice_AmuletRules.TransferResult;
  };
} //namespace TransferCommandResult


export declare type TransferCommand_SendResult = {
  result: TransferCommandResult;
  sender: damlTypes.Party;
  nonce: damlTypes.Int;
};

export declare const TransferCommand_SendResult:
  damlTypes.Serializable<TransferCommand_SendResult> & {
  }
;


export declare type TransferCommand_Expire = {
  p: damlTypes.Party;
};

export declare const TransferCommand_Expire:
  damlTypes.Serializable<TransferCommand_Expire> & {
  }
;


export declare type TransferCommand_Withdraw = {
};

export declare const TransferCommand_Withdraw:
  damlTypes.Serializable<TransferCommand_Withdraw> & {
  }
;


export declare type TransferCommand_Send = {
  context: Splice_AmuletRules.PaymentTransferContext;
  inputs: Splice_AmuletRules.TransferInput[];
  transferPreapprovalCidO: damlTypes.Optional<damlTypes.ContractId<Splice_AmuletRules.TransferPreapproval>>;
  transferCounterCid: damlTypes.ContractId<TransferCommandCounter>;
};

export declare const TransferCommand_Send:
  damlTypes.Serializable<TransferCommand_Send> & {
  }
;


export declare type TransferCommand = {
  dso: damlTypes.Party;
  sender: damlTypes.Party;
  receiver: damlTypes.Party;
  delegate: damlTypes.Party;
  amount: damlTypes.Numeric;
  expiresAt: damlTypes.Time;
  nonce: damlTypes.Int;
  description: damlTypes.Optional<string>;
};

export declare interface TransferCommandInterface {
  TransferCommand_Expire: damlTypes.Choice<TransferCommand, TransferCommand_Expire, TransferCommand_ExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferCommand, undefined>>;
  TransferCommand_Send: damlTypes.Choice<TransferCommand, TransferCommand_Send, TransferCommand_SendResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferCommand, undefined>>;
  Archive: damlTypes.Choice<TransferCommand, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferCommand, undefined>>;
  TransferCommand_Withdraw: damlTypes.Choice<TransferCommand, TransferCommand_Withdraw, TransferCommand_WithdrawResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferCommand, undefined>>;
}
export declare const TransferCommand:
  damlTypes.Template<TransferCommand, undefined, '#splice-amulet:Splice.ExternalPartyAmuletRules:TransferCommand'> &
  damlTypes.ToInterface<TransferCommand, never> &
  TransferCommandInterface;

export declare namespace TransferCommand {
}



export declare type TransferCommandCounter = {
  dso: damlTypes.Party;
  sender: damlTypes.Party;
  nextNonce: damlTypes.Int;
};

export declare interface TransferCommandCounterInterface {
  Archive: damlTypes.Choice<TransferCommandCounter, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferCommandCounter, undefined>>;
}
export declare const TransferCommandCounter:
  damlTypes.Template<TransferCommandCounter, undefined, '#splice-amulet:Splice.ExternalPartyAmuletRules:TransferCommandCounter'> &
  damlTypes.ToInterface<TransferCommandCounter, never> &
  TransferCommandCounterInterface;

export declare namespace TransferCommandCounter {
}



export declare type ExternalPartyAmuletRules_CreateTransferCommandResult = {
  transferCommandCid: damlTypes.ContractId<TransferCommand>;
};

export declare const ExternalPartyAmuletRules_CreateTransferCommandResult:
  damlTypes.Serializable<ExternalPartyAmuletRules_CreateTransferCommandResult> & {
  }
;


export declare type ExternalPartyAmuletRules_CreateTransferCommand = {
  sender: damlTypes.Party;
  receiver: damlTypes.Party;
  delegate: damlTypes.Party;
  amount: damlTypes.Numeric;
  expiresAt: damlTypes.Time;
  nonce: damlTypes.Int;
  description: damlTypes.Optional<string>;
  expectedDso: damlTypes.Optional<damlTypes.Party>;
};

export declare const ExternalPartyAmuletRules_CreateTransferCommand:
  damlTypes.Serializable<ExternalPartyAmuletRules_CreateTransferCommand> & {
  }
;


export declare type ExternalPartyAmuletRules = {
  dso: damlTypes.Party;
};

export declare interface ExternalPartyAmuletRulesInterface {
  ExternalPartyAmuletRules_CreateTransferCommand: damlTypes.Choice<ExternalPartyAmuletRules, ExternalPartyAmuletRules_CreateTransferCommand, ExternalPartyAmuletRules_CreateTransferCommandResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExternalPartyAmuletRules, undefined>>;
  Archive: damlTypes.Choice<ExternalPartyAmuletRules, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExternalPartyAmuletRules, undefined>>;
}
export declare const ExternalPartyAmuletRules:
  damlTypes.Template<ExternalPartyAmuletRules, undefined, '#splice-amulet:Splice.ExternalPartyAmuletRules:ExternalPartyAmuletRules'> &
  damlTypes.ToInterface<ExternalPartyAmuletRules, pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory | pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory> &
  ExternalPartyAmuletRulesInterface;

export declare namespace ExternalPartyAmuletRules {
}


