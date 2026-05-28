// Generated from Utility/Commercials/V0/Model/CommercialAgreement.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 from '@daml.js/splice-amulet-0.1.16';

import * as Utility_Commercials_V0_Model_Types from '../../../../../Utility/Commercials/V0/Model/Types/module';

export declare type CommercialAgreement_BillBaseFee_Result = {
  commercialAgreementCid: damlTypes.ContractId<CommercialAgreement>;
};

export declare const CommercialAgreement_BillBaseFee_Result:
  damlTypes.Serializable<CommercialAgreement_BillBaseFee_Result> & {
  }
;


export declare type CommercialAgreement_SetDefaultCredentialFeeBillingState_Result = {
  commercialAgreementCid: damlTypes.ContractId<CommercialAgreement>;
  credentialFeeBillingState: Utility_Commercials_V0_Model_Types.EventBillingState;
};

export declare const CommercialAgreement_SetDefaultCredentialFeeBillingState_Result:
  damlTypes.Serializable<CommercialAgreement_SetDefaultCredentialFeeBillingState_Result> & {
  }
;


export declare type CommercialAgreement_BillCredentialFeeMultiUnfeatured_Result = {
  commercialAgreementCid: damlTypes.ContractId<CommercialAgreement>;
  credentialFeeBillingState: Utility_Commercials_V0_Model_Types.EventBillingState;
};

export declare const CommercialAgreement_BillCredentialFeeMultiUnfeatured_Result:
  damlTypes.Serializable<CommercialAgreement_BillCredentialFeeMultiUnfeatured_Result> & {
  }
;


export declare type CommercialAgreement_BillCredentialFeeMulti_Result = {
  commercialAgreementCid: damlTypes.ContractId<CommercialAgreement>;
  credentialFeeBillingState: Utility_Commercials_V0_Model_Types.EventBillingState;
};

export declare const CommercialAgreement_BillCredentialFeeMulti_Result:
  damlTypes.Serializable<CommercialAgreement_BillCredentialFeeMulti_Result> & {
  }
;


export declare type CommercialAgreement_Bill_Result = {
  commercialAgreementCid: damlTypes.ContractId<CommercialAgreement>;
};

export declare const CommercialAgreement_Bill_Result:
  damlTypes.Serializable<CommercialAgreement_Bill_Result> & {
  }
;


export declare type CommercialAgreement_LockCoin_Result = {
  commercialAgreementCid: damlTypes.ContractId<CommercialAgreement>;
};

export declare const CommercialAgreement_LockCoin_Result:
  damlTypes.Serializable<CommercialAgreement_LockCoin_Result> & {
  }
;


export declare type CommercialAgreement_FlushExpiredDeposit_Result = {
  commercialAgreementCid: damlTypes.ContractId<CommercialAgreement>;
};

export declare const CommercialAgreement_FlushExpiredDeposit_Result:
  damlTypes.Serializable<CommercialAgreement_FlushExpiredDeposit_Result> & {
  }
;


export declare type CommercialAgreement_Revoke_Result = {
  unlockedDeposit: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
};

export declare const CommercialAgreement_Revoke_Result:
  damlTypes.Serializable<CommercialAgreement_Revoke_Result> & {
  }
;


export declare type CommercialAgreement_Modify_Result = {
  commercialAgreementCid: damlTypes.ContractId<CommercialAgreement>;
};

export declare const CommercialAgreement_Modify_Result:
  damlTypes.Serializable<CommercialAgreement_Modify_Result> & {
  }
;


export declare type CommercialAgreement_ModifyDataPublishingConsent_Result = {
  commercialAgreementCid: damlTypes.ContractId<CommercialAgreement>;
};

export declare const CommercialAgreement_ModifyDataPublishingConsent_Result:
  damlTypes.Serializable<CommercialAgreement_ModifyDataPublishingConsent_Result> & {
  }
;


export declare type CommercialAgreement_BillBaseFee = {
  transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  transferPreapprovalCid: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval>;
  paymentTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.PaymentTransferContext;
};

export declare const CommercialAgreement_BillBaseFee:
  damlTypes.Serializable<CommercialAgreement_BillBaseFee> & {
  }
;


export declare type CommercialAgreement_SetDefaultCredentialFeeBillingState = {
  currentLedgerOffset: damlTypes.Int;
  currentMigrationId: damlTypes.Optional<string>;
};

export declare const CommercialAgreement_SetDefaultCredentialFeeBillingState:
  damlTypes.Serializable<CommercialAgreement_SetDefaultCredentialFeeBillingState> & {
  }
;


export declare type CommercialAgreement_BillCredentialFeeMultiUnfeatured = {
  transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  transferPreapprovalCid: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval>;
  numberOfBillings: damlTypes.Int;
  currentLedgerOffset: damlTypes.Int;
  payoutThresholdCc: damlTypes.Optional<damlTypes.Numeric>;
  currentMigrationId: damlTypes.Optional<string>;
};

export declare const CommercialAgreement_BillCredentialFeeMultiUnfeatured:
  damlTypes.Serializable<CommercialAgreement_BillCredentialFeeMultiUnfeatured> & {
  }
;


export declare type CommercialAgreement_BillCredentialFeeMulti = {
  transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  transferPreapprovalCid: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval>;
  paymentTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.PaymentTransferContext;
  numberOfBillings: damlTypes.Int;
  currentLedgerOffset: damlTypes.Int;
  currentMigrationId: damlTypes.Optional<string>;
};

export declare const CommercialAgreement_BillCredentialFeeMulti:
  damlTypes.Serializable<CommercialAgreement_BillCredentialFeeMulti> & {
  }
;


export declare type CommercialAgreement_Bill = {
  transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  transferPreapprovalCid: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval>;
  paymentTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.PaymentTransferContext;
};

export declare const CommercialAgreement_Bill:
  damlTypes.Serializable<CommercialAgreement_Bill> & {
  }
;


export declare type CommercialAgreement_LockCoin = {
  targetAmount: damlTypes.Numeric;
  coinCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const CommercialAgreement_LockCoin:
  damlTypes.Serializable<CommercialAgreement_LockCoin> & {
  }
;


export declare type CommercialAgreement_FlushExpiredDeposit = {
  actor: damlTypes.Party;
};

export declare const CommercialAgreement_FlushExpiredDeposit:
  damlTypes.Serializable<CommercialAgreement_FlushExpiredDeposit> & {
  }
;


export declare type CommercialAgreement_Revoke = {
  transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  actor: damlTypes.Party;
  transferPreapprovalCid: damlTypes.Optional<damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval>>;
};

export declare const CommercialAgreement_Revoke:
  damlTypes.Serializable<CommercialAgreement_Revoke> & {
  }
;


export declare type CommercialAgreement_Modify = {
  feeReceiver: damlTypes.Party;
  utilityFees: Utility_Commercials_V0_Model_Types.UtilityFees;
  rewardReceiver: damlTypes.Optional<damlTypes.Party>;
};

export declare const CommercialAgreement_Modify:
  damlTypes.Serializable<CommercialAgreement_Modify> & {
  }
;


export declare type CommercialAgreement_ModifyDataPublishingConsent = {
  dataPublishingConsent: boolean;
};

export declare const CommercialAgreement_ModifyDataPublishingConsent:
  damlTypes.Serializable<CommercialAgreement_ModifyDataPublishingConsent> & {
  }
;


export declare type CommercialAgreement = {
  operator: damlTypes.Party;
  user: damlTypes.Party;
  feeReceiver: damlTypes.Party;
  lockedAmuletCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.LockedAmulet>[];
  currentLockedAmuletAmountCc: damlTypes.Numeric;
  utilityFees: Utility_Commercials_V0_Model_Types.UtilityFees;
  dso: damlTypes.Party;
  baseFeeBillingState: damlTypes.Optional<Utility_Commercials_V0_Model_Types.BillingState>;
  credentialFeeBillingState: damlTypes.Optional<Utility_Commercials_V0_Model_Types.EventBillingState>;
  accruedFeesCc: damlTypes.Optional<damlTypes.Numeric>;
  rewardReceiver: damlTypes.Optional<damlTypes.Party>;
  dataPublishingConsent: damlTypes.Optional<boolean>;
};

export declare interface CommercialAgreementInterface {
  CommercialAgreement_Revoke: damlTypes.Choice<CommercialAgreement, CommercialAgreement_Revoke, CommercialAgreement_Revoke_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  CommercialAgreement_BillCredentialFeeMultiUnfeatured: damlTypes.Choice<CommercialAgreement, CommercialAgreement_BillCredentialFeeMultiUnfeatured, CommercialAgreement_BillCredentialFeeMultiUnfeatured_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  CommercialAgreement_BillCredentialFeeMulti: damlTypes.Choice<CommercialAgreement, CommercialAgreement_BillCredentialFeeMulti, CommercialAgreement_BillCredentialFeeMulti_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  CommercialAgreement_BillBaseFee: damlTypes.Choice<CommercialAgreement, CommercialAgreement_BillBaseFee, CommercialAgreement_BillBaseFee_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  CommercialAgreement_LockCoin: damlTypes.Choice<CommercialAgreement, CommercialAgreement_LockCoin, CommercialAgreement_LockCoin_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  CommercialAgreement_Modify: damlTypes.Choice<CommercialAgreement, CommercialAgreement_Modify, CommercialAgreement_Modify_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  CommercialAgreement_FlushExpiredDeposit: damlTypes.Choice<CommercialAgreement, CommercialAgreement_FlushExpiredDeposit, CommercialAgreement_FlushExpiredDeposit_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  CommercialAgreement_SetDefaultCredentialFeeBillingState: damlTypes.Choice<CommercialAgreement, CommercialAgreement_SetDefaultCredentialFeeBillingState, CommercialAgreement_SetDefaultCredentialFeeBillingState_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  Archive: damlTypes.Choice<CommercialAgreement, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  CommercialAgreement_ModifyDataPublishingConsent: damlTypes.Choice<CommercialAgreement, CommercialAgreement_ModifyDataPublishingConsent, CommercialAgreement_ModifyDataPublishingConsent_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
  CommercialAgreement_Bill: damlTypes.Choice<CommercialAgreement, CommercialAgreement_Bill, CommercialAgreement_Bill_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreement, undefined>>;
}
export declare const CommercialAgreement:
  damlTypes.Template<CommercialAgreement, undefined, '#utility-commercials-v0:Utility.Commercials.V0.Model.CommercialAgreement:CommercialAgreement'> &
  damlTypes.ToInterface<CommercialAgreement, never> &
  CommercialAgreementInterface;

export declare namespace CommercialAgreement {
}


