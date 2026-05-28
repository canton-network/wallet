// Generated from Utility/Registry/App/V0/Model/TransferPreapproval.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 from '@daml.js/splice-api-token-transfer-instruction-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type TransferPreapproval_Modify_Result = {
  transferPreapprovalCid: damlTypes.ContractId<TransferPreapproval>;
};

export declare const TransferPreapproval_Modify_Result:
  damlTypes.Serializable<TransferPreapproval_Modify_Result> & {
  }
;


export declare type TransferPreapproval_Withdraw_Result = {
};

export declare const TransferPreapproval_Withdraw_Result:
  damlTypes.Serializable<TransferPreapproval_Withdraw_Result> & {
  }
;


export declare type TransferPreapproval_Modify = {
  newInstrumentAllowances: InstrumentAllowance[];
};

export declare const TransferPreapproval_Modify:
  damlTypes.Serializable<TransferPreapproval_Modify> & {
  }
;


export declare type TransferPreapproval_Withdraw = {
  actor: damlTypes.Party;
};

export declare const TransferPreapproval_Withdraw:
  damlTypes.Serializable<TransferPreapproval_Withdraw> & {
  }
;


export declare type TransferPreapproval = {
  operator: damlTypes.Party;
  receiver: damlTypes.Party;
  instrumentAdmin: damlTypes.Party;
  instrumentAllowances: InstrumentAllowance[];
};

export declare interface TransferPreapprovalInterface {
  TransferPreapproval_Withdraw: damlTypes.Choice<TransferPreapproval, TransferPreapproval_Withdraw, TransferPreapproval_Withdraw_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferPreapproval, undefined>>;
  Archive: damlTypes.Choice<TransferPreapproval, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferPreapproval, undefined>>;
  TransferPreapproval_Modify: damlTypes.Choice<TransferPreapproval, TransferPreapproval_Modify, TransferPreapproval_Modify_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferPreapproval, undefined>>;
}
export declare const TransferPreapproval:
  damlTypes.Template<TransferPreapproval, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Model.TransferPreapproval:TransferPreapproval'> &
  damlTypes.ToInterface<TransferPreapproval, pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory> &
  TransferPreapprovalInterface;

export declare namespace TransferPreapproval {
}



export declare type InstrumentAllowance = {
  id: string;
};

export declare const InstrumentAllowance:
  damlTypes.Serializable<InstrumentAllowance> & {
  }
;

