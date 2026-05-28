// Generated from Utility/Credential/App/V0/Model/Billing.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda from '@daml.js/splice-api-featured-app-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 from '@daml.js/splice-amulet-0.1.16';

import * as Utility_Credential_App_V0_Model_Accounting from '../../../../../../Utility/Credential/App/V0/Model/Accounting/module';
import * as Utility_Credential_App_V0_Types from '../../../../../../Utility/Credential/App/V0/Types/module';

export declare type BillingParamsAdjustmentRequest_Cancel_Result =
  | 'BillingParamsAdjustmentRequest_Cancel_Result'
;

export declare const BillingParamsAdjustmentRequest_Cancel_Result:
  damlTypes.Serializable<BillingParamsAdjustmentRequest_Cancel_Result> & {
  }
& { readonly keys: BillingParamsAdjustmentRequest_Cancel_Result[] } & { readonly [e in BillingParamsAdjustmentRequest_Cancel_Result]: e }
;


export declare type BillingParamsAdjustmentRequest_Accept_Result = {
  credentialBillingCid: damlTypes.ContractId<CredentialBilling>;
};

export declare const BillingParamsAdjustmentRequest_Accept_Result:
  damlTypes.Serializable<BillingParamsAdjustmentRequest_Accept_Result> & {
  }
;


export declare type CredentialBilling_RequestToAdjustBillingParams_Result = {
  requestCid: damlTypes.ContractId<BillingParamsAdjustmentRequest>;
};

export declare const CredentialBilling_RequestToAdjustBillingParams_Result:
  damlTypes.Serializable<CredentialBilling_RequestToAdjustBillingParams_Result> & {
  }
;


export declare type BillingParamsAdjustmentRequest_Cancel = {
  actor: damlTypes.Party;
};

export declare const BillingParamsAdjustmentRequest_Cancel:
  damlTypes.Serializable<BillingParamsAdjustmentRequest_Cancel> & {
  }
;


export declare type BillingParamsAdjustmentRequest_Accept = {
  credentialBillingCid: damlTypes.ContractId<CredentialBilling>;
};

export declare const BillingParamsAdjustmentRequest_Accept:
  damlTypes.Serializable<BillingParamsAdjustmentRequest_Accept> & {
  }
;


export declare type BillingParamsAdjustmentRequest = {
  operator: damlTypes.Party;
  issuer: damlTypes.Party;
  holder: damlTypes.Party;
  params: Utility_Credential_App_V0_Types.BillingParams;
  credentialId: string;
};

export declare interface BillingParamsAdjustmentRequestInterface {
  BillingParamsAdjustmentRequest_Accept: damlTypes.Choice<BillingParamsAdjustmentRequest, BillingParamsAdjustmentRequest_Accept, BillingParamsAdjustmentRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BillingParamsAdjustmentRequest, undefined>>;
  Archive: damlTypes.Choice<BillingParamsAdjustmentRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BillingParamsAdjustmentRequest, undefined>>;
  BillingParamsAdjustmentRequest_Cancel: damlTypes.Choice<BillingParamsAdjustmentRequest, BillingParamsAdjustmentRequest_Cancel, BillingParamsAdjustmentRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BillingParamsAdjustmentRequest, undefined>>;
}
export declare const BillingParamsAdjustmentRequest:
  damlTypes.Template<BillingParamsAdjustmentRequest, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Billing:BillingParamsAdjustmentRequest'> &
  damlTypes.ToInterface<BillingParamsAdjustmentRequest, never> &
  BillingParamsAdjustmentRequestInterface;

export declare namespace BillingParamsAdjustmentRequest {
}



export declare type CanceledCredentialBilling = {
  payload: CredentialBilling;
  cancelledBy: damlTypes.Party;
  cancelledAt: damlTypes.Time;
  returnedUserAmountCc: damlTypes.Numeric;
};

export declare interface CanceledCredentialBillingInterface {
  Archive: damlTypes.Choice<CanceledCredentialBilling, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CanceledCredentialBilling, undefined>>;
}
export declare const CanceledCredentialBilling:
  damlTypes.Template<CanceledCredentialBilling, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Billing:CanceledCredentialBilling'> &
  damlTypes.ToInterface<CanceledCredentialBilling, never> &
  CanceledCredentialBillingInterface;

export declare namespace CanceledCredentialBilling {
}



export declare type CredentialBilling_TopUp_Result = {
  newCredentialBillingCid: damlTypes.ContractId<CredentialBilling>;
};

export declare const CredentialBilling_TopUp_Result:
  damlTypes.Serializable<CredentialBilling_TopUp_Result> & {
  }
;


export declare type CredentialBilling_FlushExpiredDeposit_Result = {
  newCredentialBillingCid: damlTypes.ContractId<CredentialBilling>;
};

export declare const CredentialBilling_FlushExpiredDeposit_Result:
  damlTypes.Serializable<CredentialBilling_FlushExpiredDeposit_Result> & {
  }
;


export declare type CredentialBilling_DistributeAndAdjustDeposit_Result = {
  newCredentialBillingCid: damlTypes.ContractId<CredentialBilling>;
  transferResult: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult;
};

export declare const CredentialBilling_DistributeAndAdjustDeposit_Result:
  damlTypes.Serializable<CredentialBilling_DistributeAndAdjustDeposit_Result> & {
  }
;


export declare type CredentialBilling_Distribute_Result = {
  transferResult: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult;
};

export declare const CredentialBilling_Distribute_Result:
  damlTypes.Serializable<CredentialBilling_Distribute_Result> & {
  }
;


export declare type CredentialBilling_Cancel_Result = {
  canceledCredentialBillingCid: damlTypes.ContractId<CanceledCredentialBilling>;
};

export declare const CredentialBilling_Cancel_Result:
  damlTypes.Serializable<CredentialBilling_Cancel_Result> & {
  }
;


export declare type CredentialBilling_Bill_Result = {
  billingCycleParams: Utility_Credential_App_V0_Types.BillingCycleParams;
  transferResult: damlTypes.Optional<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult>;
  newCredentialBillingCid: damlTypes.ContractId<CredentialBilling>;
  feeRecordCid: damlTypes.Optional<damlTypes.ContractId<Utility_Credential_App_V0_Model_Accounting.FeeRecord>>;
};

export declare const CredentialBilling_Bill_Result:
  damlTypes.Serializable<CredentialBilling_Bill_Result> & {
  }
;


export declare type CredentialBilling_AdjustBillingParams_Result = {
  newCredentialBillingCid: damlTypes.ContractId<CredentialBilling>;
};

export declare const CredentialBilling_AdjustBillingParams_Result:
  damlTypes.Serializable<CredentialBilling_AdjustBillingParams_Result> & {
  }
;


export declare type CredentialBilling_TopUp = {
  amountUsd: damlTypes.Numeric;
  coinCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const CredentialBilling_TopUp:
  damlTypes.Serializable<CredentialBilling_TopUp> & {
  }
;


export declare type CredentialBilling_DistributeAndAdjustDeposit = {
  amountUsd: damlTypes.Numeric;
  coinCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const CredentialBilling_DistributeAndAdjustDeposit:
  damlTypes.Serializable<CredentialBilling_DistributeAndAdjustDeposit> & {
  }
;


export declare type CredentialBilling_Distribute = {
  amountUsd: damlTypes.Numeric;
  coinCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const CredentialBilling_Distribute:
  damlTypes.Serializable<CredentialBilling_Distribute> & {
  }
;


export declare type CredentialBilling_FlushExpiredDeposit = {
  actor: damlTypes.Party;
};

export declare const CredentialBilling_FlushExpiredDeposit:
  damlTypes.Serializable<CredentialBilling_FlushExpiredDeposit> & {
  }
;


export declare type CredentialBilling_CancelExpired = {
  actor: damlTypes.Party;
};

export declare const CredentialBilling_CancelExpired:
  damlTypes.Serializable<CredentialBilling_CancelExpired> & {
  }
;


export declare type CredentialBilling_Cancel = {
  actor: damlTypes.Party;
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const CredentialBilling_Cancel:
  damlTypes.Serializable<CredentialBilling_Cancel> & {
  }
;


export declare type CredentialBilling_Bill = {
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  enableFeeRecord: damlTypes.Optional<boolean>;
  rewardReceiver: damlTypes.Optional<damlTypes.Party>;
  featuredAppRightCid: damlTypes.Optional<damlTypes.ContractId<pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppRight>>;
};

export declare const CredentialBilling_Bill:
  damlTypes.Serializable<CredentialBilling_Bill> & {
  }
;


export declare type CredentialBilling_RequestToAdjustBillingParams = {
  newParams: Utility_Credential_App_V0_Types.BillingParams;
};

export declare const CredentialBilling_RequestToAdjustBillingParams:
  damlTypes.Serializable<CredentialBilling_RequestToAdjustBillingParams> & {
  }
;


export declare type CredentialBilling_AdjustBillingParams = {
  newParams: Utility_Credential_App_V0_Types.BillingParams;
};

export declare const CredentialBilling_AdjustBillingParams:
  damlTypes.Serializable<CredentialBilling_AdjustBillingParams> & {
  }
;


export declare type CredentialBilling = {
  operator: damlTypes.Party;
  issuer: damlTypes.Party;
  holder: damlTypes.Party;
  dso: damlTypes.Party;
  credentialId: string;
  params: Utility_Credential_App_V0_Types.BillingParams;
  balanceState: Utility_Credential_App_V0_Types.BalanceState;
  billingState: Utility_Credential_App_V0_Types.BillingState;
  deposits: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.LockedAmulet>[];
};

export declare interface CredentialBillingInterface {
  CredentialBilling_RequestToAdjustBillingParams: damlTypes.Choice<CredentialBilling, CredentialBilling_RequestToAdjustBillingParams, CredentialBilling_RequestToAdjustBillingParams_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
  CredentialBilling_DistributeAndAdjustDeposit: damlTypes.Choice<CredentialBilling, CredentialBilling_DistributeAndAdjustDeposit, CredentialBilling_DistributeAndAdjustDeposit_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
  CredentialBilling_Bill: damlTypes.Choice<CredentialBilling, CredentialBilling_Bill, CredentialBilling_Bill_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
  CredentialBilling_Cancel: damlTypes.Choice<CredentialBilling, CredentialBilling_Cancel, CredentialBilling_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
  CredentialBilling_TopUp: damlTypes.Choice<CredentialBilling, CredentialBilling_TopUp, CredentialBilling_TopUp_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
  CredentialBilling_Distribute: damlTypes.Choice<CredentialBilling, CredentialBilling_Distribute, CredentialBilling_Distribute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
  CredentialBilling_CancelExpired: damlTypes.Choice<CredentialBilling, CredentialBilling_CancelExpired, CredentialBilling_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
  CredentialBilling_FlushExpiredDeposit: damlTypes.Choice<CredentialBilling, CredentialBilling_FlushExpiredDeposit, CredentialBilling_FlushExpiredDeposit_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
  Archive: damlTypes.Choice<CredentialBilling, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
  CredentialBilling_AdjustBillingParams: damlTypes.Choice<CredentialBilling, CredentialBilling_AdjustBillingParams, CredentialBilling_AdjustBillingParams_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialBilling, undefined>>;
}
export declare const CredentialBilling:
  damlTypes.Template<CredentialBilling, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Billing:CredentialBilling'> &
  damlTypes.ToInterface<CredentialBilling, never> &
  CredentialBillingInterface;

export declare namespace CredentialBilling {
}


