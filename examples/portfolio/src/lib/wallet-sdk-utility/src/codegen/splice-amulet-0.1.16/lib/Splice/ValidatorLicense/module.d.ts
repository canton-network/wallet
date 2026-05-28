// Generated from Splice/ValidatorLicense.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Splice_Round from '../../Splice/Round/module';
import * as Splice_Types from '../../Splice/Types/module';

export declare type ValidatorLivenessActivityRecord_DsoExpire = {
  closedRoundCid: damlTypes.ContractId<Splice_Round.ClosedMiningRound>;
};

export declare const ValidatorLivenessActivityRecord_DsoExpire:
  damlTypes.Serializable<ValidatorLivenessActivityRecord_DsoExpire> & {
  }
;


export declare type ValidatorLivenessActivityRecord = {
  dso: damlTypes.Party;
  validator: damlTypes.Party;
  round: Splice_Types.Round;
};

export declare interface ValidatorLivenessActivityRecordInterface {
  Archive: damlTypes.Choice<ValidatorLivenessActivityRecord, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorLivenessActivityRecord, undefined>>;
  ValidatorLivenessActivityRecord_DsoExpire: damlTypes.Choice<ValidatorLivenessActivityRecord, ValidatorLivenessActivityRecord_DsoExpire, ValidatorLivenessActivityRecord_DsoExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorLivenessActivityRecord, undefined>>;
}
export declare const ValidatorLivenessActivityRecord:
  damlTypes.Template<ValidatorLivenessActivityRecord, undefined, '#splice-amulet:Splice.ValidatorLicense:ValidatorLivenessActivityRecord'> &
  damlTypes.ToInterface<ValidatorLivenessActivityRecord, never> &
  ValidatorLivenessActivityRecordInterface;

export declare namespace ValidatorLivenessActivityRecord {
}



export declare type ValidatorFaucetCoupon_DsoExpire = {
  closedRoundCid: damlTypes.ContractId<Splice_Round.ClosedMiningRound>;
};

export declare const ValidatorFaucetCoupon_DsoExpire:
  damlTypes.Serializable<ValidatorFaucetCoupon_DsoExpire> & {
  }
;


export declare type ValidatorFaucetCoupon = {
  dso: damlTypes.Party;
  validator: damlTypes.Party;
  round: Splice_Types.Round;
};

export declare interface ValidatorFaucetCouponInterface {
  ValidatorFaucetCoupon_DsoExpire: damlTypes.Choice<ValidatorFaucetCoupon, ValidatorFaucetCoupon_DsoExpire, ValidatorFaucetCoupon_DsoExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorFaucetCoupon, undefined>>;
  Archive: damlTypes.Choice<ValidatorFaucetCoupon, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorFaucetCoupon, undefined>>;
}
export declare const ValidatorFaucetCoupon:
  damlTypes.Template<ValidatorFaucetCoupon, undefined, '#splice-amulet:Splice.ValidatorLicense:ValidatorFaucetCoupon'> &
  damlTypes.ToInterface<ValidatorFaucetCoupon, never> &
  ValidatorFaucetCouponInterface;

export declare namespace ValidatorFaucetCoupon {
}



export declare type ValidatorLicense_ReportActive = {
};

export declare const ValidatorLicense_ReportActive:
  damlTypes.Serializable<ValidatorLicense_ReportActive> & {
  }
;


export declare type ValidatorLicense_UpdateMetadata = {
  version: string;
  contactPoint: string;
};

export declare const ValidatorLicense_UpdateMetadata:
  damlTypes.Serializable<ValidatorLicense_UpdateMetadata> & {
  }
;


export declare type ValidatorLicense_Cancel = {
  reason: string;
};

export declare const ValidatorLicense_Cancel:
  damlTypes.Serializable<ValidatorLicense_Cancel> & {
  }
;


export declare type ValidatorLicense_Withdraw = {
  reason: string;
};

export declare const ValidatorLicense_Withdraw:
  damlTypes.Serializable<ValidatorLicense_Withdraw> & {
  }
;


export declare type ValidatorLicense_RecordValidatorLivenessActivity = {
  openRoundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const ValidatorLicense_RecordValidatorLivenessActivity:
  damlTypes.Serializable<ValidatorLicense_RecordValidatorLivenessActivity> & {
  }
;


export declare type ValidatorLicense_ReceiveFaucetCoupon = {
  openRoundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const ValidatorLicense_ReceiveFaucetCoupon:
  damlTypes.Serializable<ValidatorLicense_ReceiveFaucetCoupon> & {
  }
;


export declare type ValidatorLicense = {
  validator: damlTypes.Party;
  sponsor: damlTypes.Party;
  dso: damlTypes.Party;
  faucetState: damlTypes.Optional<FaucetState>;
  metadata: damlTypes.Optional<ValidatorLicenseMetadata>;
  lastActiveAt: damlTypes.Optional<damlTypes.Time>;
};

export declare interface ValidatorLicenseInterface {
  ValidatorLicense_ReceiveFaucetCoupon: damlTypes.Choice<ValidatorLicense, ValidatorLicense_ReceiveFaucetCoupon, ValidatorLicense_ReceiveFaucetCouponResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorLicense, undefined>>;
  ValidatorLicense_RecordValidatorLivenessActivity: damlTypes.Choice<ValidatorLicense, ValidatorLicense_RecordValidatorLivenessActivity, ValidatorLicense_RecordValidatorLivenessActivityResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorLicense, undefined>>;
  ValidatorLicense_Withdraw: damlTypes.Choice<ValidatorLicense, ValidatorLicense_Withdraw, ValidatorLicense_WithdrawResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorLicense, undefined>>;
  ValidatorLicense_Cancel: damlTypes.Choice<ValidatorLicense, ValidatorLicense_Cancel, ValidatorLicense_CancelResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorLicense, undefined>>;
  ValidatorLicense_UpdateMetadata: damlTypes.Choice<ValidatorLicense, ValidatorLicense_UpdateMetadata, ValidatorLicense_UpdateMetadataResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorLicense, undefined>>;
  ValidatorLicense_ReportActive: damlTypes.Choice<ValidatorLicense, ValidatorLicense_ReportActive, ValidatorLicense_ReportActiveResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorLicense, undefined>>;
  Archive: damlTypes.Choice<ValidatorLicense, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorLicense, undefined>>;
}
export declare const ValidatorLicense:
  damlTypes.Template<ValidatorLicense, undefined, '#splice-amulet:Splice.ValidatorLicense:ValidatorLicense'> &
  damlTypes.ToInterface<ValidatorLicense, never> &
  ValidatorLicenseInterface;

export declare namespace ValidatorLicense {
}



export declare type ValidatorLicenseMetadata = {
  lastUpdatedAt: damlTypes.Time;
  version: string;
  contactPoint: string;
};

export declare const ValidatorLicenseMetadata:
  damlTypes.Serializable<ValidatorLicenseMetadata> & {
  }
;


export declare type ValidatorLivenessActivityRecord_DsoExpireResult =
  | 'ValidatorLivenessActivityRecord_DsoExpireResult'
;

export declare const ValidatorLivenessActivityRecord_DsoExpireResult:
  damlTypes.Serializable<ValidatorLivenessActivityRecord_DsoExpireResult> & {
  }
& { readonly keys: ValidatorLivenessActivityRecord_DsoExpireResult[] } & { readonly [e in ValidatorLivenessActivityRecord_DsoExpireResult]: e }
;


export declare type ValidatorFaucetCoupon_DsoExpireResult =
  | 'ValidatorFaucetCoupon_DsoExpireResult'
;

export declare const ValidatorFaucetCoupon_DsoExpireResult:
  damlTypes.Serializable<ValidatorFaucetCoupon_DsoExpireResult> & {
  }
& { readonly keys: ValidatorFaucetCoupon_DsoExpireResult[] } & { readonly [e in ValidatorFaucetCoupon_DsoExpireResult]: e }
;


export declare type ValidatorLicense_ReportActiveResult = {
  licenseCid: damlTypes.ContractId<ValidatorLicense>;
};

export declare const ValidatorLicense_ReportActiveResult:
  damlTypes.Serializable<ValidatorLicense_ReportActiveResult> & {
  }
;


export declare type ValidatorLicense_UpdateMetadataResult = {
  licenseCid: damlTypes.ContractId<ValidatorLicense>;
};

export declare const ValidatorLicense_UpdateMetadataResult:
  damlTypes.Serializable<ValidatorLicense_UpdateMetadataResult> & {
  }
;


export declare type ValidatorLicense_CancelResult =
  | 'ValidatorLicense_CancelResult'
;

export declare const ValidatorLicense_CancelResult:
  damlTypes.Serializable<ValidatorLicense_CancelResult> & {
  }
& { readonly keys: ValidatorLicense_CancelResult[] } & { readonly [e in ValidatorLicense_CancelResult]: e }
;


export declare type ValidatorLicense_WithdrawResult =
  | 'ValidatorLicense_WithdrawResult'
;

export declare const ValidatorLicense_WithdrawResult:
  damlTypes.Serializable<ValidatorLicense_WithdrawResult> & {
  }
& { readonly keys: ValidatorLicense_WithdrawResult[] } & { readonly [e in ValidatorLicense_WithdrawResult]: e }
;


export declare type ValidatorLicense_RecordValidatorLivenessActivityResult = {
  licenseCid: damlTypes.ContractId<ValidatorLicense>;
  couponCid: damlTypes.ContractId<ValidatorLivenessActivityRecord>;
};

export declare const ValidatorLicense_RecordValidatorLivenessActivityResult:
  damlTypes.Serializable<ValidatorLicense_RecordValidatorLivenessActivityResult> & {
  }
;


export declare type ValidatorLicense_ReceiveFaucetCouponResult = {
  licenseCid: damlTypes.ContractId<ValidatorLicense>;
  couponCid: damlTypes.ContractId<ValidatorFaucetCoupon>;
};

export declare const ValidatorLicense_ReceiveFaucetCouponResult:
  damlTypes.Serializable<ValidatorLicense_ReceiveFaucetCouponResult> & {
  }
;


export declare type FaucetState = {
  firstReceivedFor: Splice_Types.Round;
  lastReceivedFor: Splice_Types.Round;
  numCouponsMissed: damlTypes.Int;
};

export declare const FaucetState:
  damlTypes.Serializable<FaucetState> & {
  }
;

