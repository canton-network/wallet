// Generated from Splice/Amulet.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b from '@daml.js/splice-api-token-holding-v1-1.0.0';
import * as pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda from '@daml.js/splice-api-featured-app-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea from '@daml.js/splice-api-featured-app-v2-1.0.0';

import * as Splice_Expiry from '../../Splice/Expiry/module';
import * as Splice_Fees from '../../Splice/Fees/module';
import * as Splice_Round from '../../Splice/Round/module';
import * as Splice_Types from '../../Splice/Types/module';

export declare type UnclaimedActivityRecord_DsoExpire = {
};

export declare const UnclaimedActivityRecord_DsoExpire:
  damlTypes.Serializable<UnclaimedActivityRecord_DsoExpire> & {
  }
;


export declare type UnclaimedActivityRecord = {
  dso: damlTypes.Party;
  beneficiary: damlTypes.Party;
  amount: damlTypes.Numeric;
  reason: string;
  expiresAt: damlTypes.Time;
};

export declare interface UnclaimedActivityRecordInterface {
  UnclaimedActivityRecord_DsoExpire: damlTypes.Choice<UnclaimedActivityRecord, UnclaimedActivityRecord_DsoExpire, UnclaimedActivityRecord_DsoExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnclaimedActivityRecord, undefined>>;
  Archive: damlTypes.Choice<UnclaimedActivityRecord, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnclaimedActivityRecord, undefined>>;
}
export declare const UnclaimedActivityRecord:
  damlTypes.Template<UnclaimedActivityRecord, undefined, '#splice-amulet:Splice.Amulet:UnclaimedActivityRecord'> &
  damlTypes.ToInterface<UnclaimedActivityRecord, never> &
  UnclaimedActivityRecordInterface;

export declare namespace UnclaimedActivityRecord {
}



export declare type UnclaimedReward = {
  dso: damlTypes.Party;
  amount: damlTypes.Numeric;
};

export declare interface UnclaimedRewardInterface {
  Archive: damlTypes.Choice<UnclaimedReward, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnclaimedReward, undefined>>;
}
export declare const UnclaimedReward:
  damlTypes.Template<UnclaimedReward, undefined, '#splice-amulet:Splice.Amulet:UnclaimedReward'> &
  damlTypes.ToInterface<UnclaimedReward, never> &
  UnclaimedRewardInterface;

export declare namespace UnclaimedReward {
}



export declare type DevelopmentFundCoupon_DsoExpire = {
};

export declare const DevelopmentFundCoupon_DsoExpire:
  damlTypes.Serializable<DevelopmentFundCoupon_DsoExpire> & {
  }
;


export declare type DevelopmentFundCoupon_Reject = {
  reason: string;
};

export declare const DevelopmentFundCoupon_Reject:
  damlTypes.Serializable<DevelopmentFundCoupon_Reject> & {
  }
;


export declare type DevelopmentFundCoupon_Withdraw = {
  reason: string;
};

export declare const DevelopmentFundCoupon_Withdraw:
  damlTypes.Serializable<DevelopmentFundCoupon_Withdraw> & {
  }
;


export declare type DevelopmentFundCoupon = {
  dso: damlTypes.Party;
  beneficiary: damlTypes.Party;
  fundManager: damlTypes.Party;
  amount: damlTypes.Numeric;
  expiresAt: damlTypes.Time;
  reason: string;
};

export declare interface DevelopmentFundCouponInterface {
  DevelopmentFundCoupon_Withdraw: damlTypes.Choice<DevelopmentFundCoupon, DevelopmentFundCoupon_Withdraw, DevelopmentFundCoupon_WithdrawResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DevelopmentFundCoupon, undefined>>;
  DevelopmentFundCoupon_Reject: damlTypes.Choice<DevelopmentFundCoupon, DevelopmentFundCoupon_Reject, DevelopmentFundCoupon_RejectResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DevelopmentFundCoupon, undefined>>;
  DevelopmentFundCoupon_DsoExpire: damlTypes.Choice<DevelopmentFundCoupon, DevelopmentFundCoupon_DsoExpire, DevelopmentFundCoupon_DsoExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DevelopmentFundCoupon, undefined>>;
  Archive: damlTypes.Choice<DevelopmentFundCoupon, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DevelopmentFundCoupon, undefined>>;
}
export declare const DevelopmentFundCoupon:
  damlTypes.Template<DevelopmentFundCoupon, undefined, '#splice-amulet:Splice.Amulet:DevelopmentFundCoupon'> &
  damlTypes.ToInterface<DevelopmentFundCoupon, never> &
  DevelopmentFundCouponInterface;

export declare namespace DevelopmentFundCoupon {
}



export declare type UnclaimedDevelopmentFundCoupon = {
  dso: damlTypes.Party;
  amount: damlTypes.Numeric;
};

export declare interface UnclaimedDevelopmentFundCouponInterface {
  Archive: damlTypes.Choice<UnclaimedDevelopmentFundCoupon, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnclaimedDevelopmentFundCoupon, undefined>>;
}
export declare const UnclaimedDevelopmentFundCoupon:
  damlTypes.Template<UnclaimedDevelopmentFundCoupon, undefined, '#splice-amulet:Splice.Amulet:UnclaimedDevelopmentFundCoupon'> &
  damlTypes.ToInterface<UnclaimedDevelopmentFundCoupon, never> &
  UnclaimedDevelopmentFundCouponInterface;

export declare namespace UnclaimedDevelopmentFundCoupon {
}



export declare type SvRewardCoupon_ArchiveAsBeneficiary = {
};

export declare const SvRewardCoupon_ArchiveAsBeneficiary:
  damlTypes.Serializable<SvRewardCoupon_ArchiveAsBeneficiary> & {
  }
;


export declare type SvRewardCoupon_DsoExpire = {
  closedRoundCid: damlTypes.ContractId<Splice_Round.ClosedMiningRound>;
};

export declare const SvRewardCoupon_DsoExpire:
  damlTypes.Serializable<SvRewardCoupon_DsoExpire> & {
  }
;


export declare type SvRewardCoupon = {
  dso: damlTypes.Party;
  sv: damlTypes.Party;
  beneficiary: damlTypes.Party;
  round: Splice_Types.Round;
  weight: damlTypes.Int;
};

export declare interface SvRewardCouponInterface {
  SvRewardCoupon_DsoExpire: damlTypes.Choice<SvRewardCoupon, SvRewardCoupon_DsoExpire, SvRewardCoupon_DsoExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<SvRewardCoupon, undefined>>;
  SvRewardCoupon_ArchiveAsBeneficiary: damlTypes.Choice<SvRewardCoupon, SvRewardCoupon_ArchiveAsBeneficiary, SvRewardCoupon_ArchiveAsBeneficiaryResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<SvRewardCoupon, undefined>>;
  Archive: damlTypes.Choice<SvRewardCoupon, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<SvRewardCoupon, undefined>>;
}
export declare const SvRewardCoupon:
  damlTypes.Template<SvRewardCoupon, undefined, '#splice-amulet:Splice.Amulet:SvRewardCoupon'> &
  damlTypes.ToInterface<SvRewardCoupon, never> &
  SvRewardCouponInterface;

export declare namespace SvRewardCoupon {
}



export declare type ValidatorRewardCoupon_ArchiveAsValidator = {
  validator: damlTypes.Party;
  rightCid: damlTypes.ContractId<ValidatorRight>;
};

export declare const ValidatorRewardCoupon_ArchiveAsValidator:
  damlTypes.Serializable<ValidatorRewardCoupon_ArchiveAsValidator> & {
  }
;


export declare type ValidatorRewardCoupon_DsoExpire = {
  closedRoundCid: damlTypes.ContractId<Splice_Round.ClosedMiningRound>;
};

export declare const ValidatorRewardCoupon_DsoExpire:
  damlTypes.Serializable<ValidatorRewardCoupon_DsoExpire> & {
  }
;


export declare type ValidatorRewardCoupon = {
  dso: damlTypes.Party;
  user: damlTypes.Party;
  amount: damlTypes.Numeric;
  round: Splice_Types.Round;
};

export declare interface ValidatorRewardCouponInterface {
  ValidatorRewardCoupon_DsoExpire: damlTypes.Choice<ValidatorRewardCoupon, ValidatorRewardCoupon_DsoExpire, ValidatorRewardCoupon_DsoExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorRewardCoupon, undefined>>;
  ValidatorRewardCoupon_ArchiveAsValidator: damlTypes.Choice<ValidatorRewardCoupon, ValidatorRewardCoupon_ArchiveAsValidator, ValidatorRewardCoupon_ArchiveAsValidatorResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorRewardCoupon, undefined>>;
  Archive: damlTypes.Choice<ValidatorRewardCoupon, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorRewardCoupon, undefined>>;
}
export declare const ValidatorRewardCoupon:
  damlTypes.Template<ValidatorRewardCoupon, undefined, '#splice-amulet:Splice.Amulet:ValidatorRewardCoupon'> &
  damlTypes.ToInterface<ValidatorRewardCoupon, never> &
  ValidatorRewardCouponInterface;

export declare namespace ValidatorRewardCoupon {
}



export declare type AppRewardCoupon_DsoExpire = {
  closedRoundCid: damlTypes.ContractId<Splice_Round.ClosedMiningRound>;
};

export declare const AppRewardCoupon_DsoExpire:
  damlTypes.Serializable<AppRewardCoupon_DsoExpire> & {
  }
;


export declare type AppRewardCoupon = {
  dso: damlTypes.Party;
  provider: damlTypes.Party;
  featured: boolean;
  amount: damlTypes.Numeric;
  round: Splice_Types.Round;
  beneficiary: damlTypes.Optional<damlTypes.Party>;
};

export declare interface AppRewardCouponInterface {
  AppRewardCoupon_DsoExpire: damlTypes.Choice<AppRewardCoupon, AppRewardCoupon_DsoExpire, AppRewardCoupon_DsoExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AppRewardCoupon, undefined>>;
  Archive: damlTypes.Choice<AppRewardCoupon, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AppRewardCoupon, undefined>>;
}
export declare const AppRewardCoupon:
  damlTypes.Template<AppRewardCoupon, undefined, '#splice-amulet:Splice.Amulet:AppRewardCoupon'> &
  damlTypes.ToInterface<AppRewardCoupon, never> &
  AppRewardCouponInterface;

export declare namespace AppRewardCoupon {
}



export declare type FeaturedAppActivityMarker = {
  dso: damlTypes.Party;
  provider: damlTypes.Party;
  beneficiary: damlTypes.Party;
  weight: damlTypes.Numeric;
};

export declare interface FeaturedAppActivityMarkerInterface {
  Archive: damlTypes.Choice<FeaturedAppActivityMarker, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FeaturedAppActivityMarker, undefined>>;
}
export declare const FeaturedAppActivityMarker:
  damlTypes.Template<FeaturedAppActivityMarker, undefined, '#splice-amulet:Splice.Amulet:FeaturedAppActivityMarker'> &
  damlTypes.ToInterface<FeaturedAppActivityMarker, pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppActivityMarker | pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppActivityMarker> &
  FeaturedAppActivityMarkerInterface;

export declare namespace FeaturedAppActivityMarker {
}



export declare type FeaturedAppRight_Cancel = {
};

export declare const FeaturedAppRight_Cancel:
  damlTypes.Serializable<FeaturedAppRight_Cancel> & {
  }
;


export declare type FeaturedAppRight_Withdraw = {
  reason: string;
};

export declare const FeaturedAppRight_Withdraw:
  damlTypes.Serializable<FeaturedAppRight_Withdraw> & {
  }
;


export declare type FeaturedAppRight = {
  dso: damlTypes.Party;
  provider: damlTypes.Party;
};

export declare interface FeaturedAppRightInterface {
  FeaturedAppRight_Withdraw: damlTypes.Choice<FeaturedAppRight, FeaturedAppRight_Withdraw, FeaturedAppRight_WithdrawResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FeaturedAppRight, undefined>>;
  FeaturedAppRight_Cancel: damlTypes.Choice<FeaturedAppRight, FeaturedAppRight_Cancel, FeaturedAppRight_CancelResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FeaturedAppRight, undefined>>;
  Archive: damlTypes.Choice<FeaturedAppRight, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FeaturedAppRight, undefined>>;
}
export declare const FeaturedAppRight:
  damlTypes.Template<FeaturedAppRight, undefined, '#splice-amulet:Splice.Amulet:FeaturedAppRight'> &
  damlTypes.ToInterface<FeaturedAppRight, pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppRight | pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppRight> &
  FeaturedAppRightInterface;

export declare namespace FeaturedAppRight {
}



export declare type ValidatorRight_ArchiveAsUser = {
};

export declare const ValidatorRight_ArchiveAsUser:
  damlTypes.Serializable<ValidatorRight_ArchiveAsUser> & {
  }
;


export declare type ValidatorRight_ArchiveAsValidator = {
};

export declare const ValidatorRight_ArchiveAsValidator:
  damlTypes.Serializable<ValidatorRight_ArchiveAsValidator> & {
  }
;


export declare type ValidatorRight = {
  dso: damlTypes.Party;
  user: damlTypes.Party;
  validator: damlTypes.Party;
};

export declare interface ValidatorRightInterface {
  ValidatorRight_ArchiveAsValidator: damlTypes.Choice<ValidatorRight, ValidatorRight_ArchiveAsValidator, ValidatorRight_ArchiveAsValidatorResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorRight, undefined>>;
  ValidatorRight_ArchiveAsUser: damlTypes.Choice<ValidatorRight, ValidatorRight_ArchiveAsUser, ValidatorRight_ArchiveAsUserResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorRight, undefined>>;
  Archive: damlTypes.Choice<ValidatorRight, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ValidatorRight, undefined>>;
}
export declare const ValidatorRight:
  damlTypes.Template<ValidatorRight, undefined, '#splice-amulet:Splice.Amulet:ValidatorRight'> &
  damlTypes.ToInterface<ValidatorRight, never> &
  ValidatorRightInterface;

export declare namespace ValidatorRight {
}



export declare type LockedAmulet_ExpireAmulet = {
  roundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const LockedAmulet_ExpireAmulet:
  damlTypes.Serializable<LockedAmulet_ExpireAmulet> & {
  }
;


export declare type LockedAmulet_OwnerExpireLock = {
  openRoundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const LockedAmulet_OwnerExpireLock:
  damlTypes.Serializable<LockedAmulet_OwnerExpireLock> & {
  }
;


export declare type LockedAmulet_Unlock = {
  openRoundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const LockedAmulet_Unlock:
  damlTypes.Serializable<LockedAmulet_Unlock> & {
  }
;


export declare type LockedAmulet = {
  amulet: Amulet;
  lock: Splice_Expiry.TimeLock;
};

export declare interface LockedAmuletInterface {
  LockedAmulet_Unlock: damlTypes.Choice<LockedAmulet, LockedAmulet_Unlock, LockedAmulet_UnlockResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockedAmulet, undefined>>;
  LockedAmulet_OwnerExpireLock: damlTypes.Choice<LockedAmulet, LockedAmulet_OwnerExpireLock, LockedAmulet_OwnerExpireLockResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockedAmulet, undefined>>;
  LockedAmulet_ExpireAmulet: damlTypes.Choice<LockedAmulet, LockedAmulet_ExpireAmulet, LockedAmulet_ExpireAmuletResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockedAmulet, undefined>>;
  Archive: damlTypes.Choice<LockedAmulet, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockedAmulet, undefined>>;
}
export declare const LockedAmulet:
  damlTypes.Template<LockedAmulet, undefined, '#splice-amulet:Splice.Amulet:LockedAmulet'> &
  damlTypes.ToInterface<LockedAmulet, pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding> &
  LockedAmuletInterface;

export declare namespace LockedAmulet {
}



export declare type Amulet_Expire = {
  roundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const Amulet_Expire:
  damlTypes.Serializable<Amulet_Expire> & {
  }
;


export declare type Amulet = {
  dso: damlTypes.Party;
  owner: damlTypes.Party;
  amount: Splice_Fees.ExpiringAmount;
};

export declare interface AmuletInterface {
  Amulet_Expire: damlTypes.Choice<Amulet, Amulet_Expire, Amulet_ExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Amulet, undefined>>;
  Archive: damlTypes.Choice<Amulet, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Amulet, undefined>>;
}
export declare const Amulet:
  damlTypes.Template<Amulet, undefined, '#splice-amulet:Splice.Amulet:Amulet'> &
  damlTypes.ToInterface<Amulet, pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding> &
  AmuletInterface;

export declare namespace Amulet {
}



export declare type DevelopmentFundCoupon_DsoExpireResult = {
  unclaimedDevelopmentFundCouponCid: damlTypes.ContractId<UnclaimedDevelopmentFundCoupon>;
};

export declare const DevelopmentFundCoupon_DsoExpireResult:
  damlTypes.Serializable<DevelopmentFundCoupon_DsoExpireResult> & {
  }
;


export declare type DevelopmentFundCoupon_RejectResult = {
  unclaimedDevelopmentFundCouponCid: damlTypes.ContractId<UnclaimedDevelopmentFundCoupon>;
};

export declare const DevelopmentFundCoupon_RejectResult:
  damlTypes.Serializable<DevelopmentFundCoupon_RejectResult> & {
  }
;


export declare type DevelopmentFundCoupon_WithdrawResult = {
  unclaimedDevelopmentFundCouponCid: damlTypes.ContractId<UnclaimedDevelopmentFundCoupon>;
};

export declare const DevelopmentFundCoupon_WithdrawResult:
  damlTypes.Serializable<DevelopmentFundCoupon_WithdrawResult> & {
  }
;


export declare type UnclaimedActivityRecord_DsoExpireResult = {
  unclaimedRewardCid: damlTypes.ContractId<UnclaimedReward>;
};

export declare const UnclaimedActivityRecord_DsoExpireResult:
  damlTypes.Serializable<UnclaimedActivityRecord_DsoExpireResult> & {
  }
;


export declare type UnclaimedActivityRecord_ArchiveAsBeneficiaryResult =
  | 'UnclaimedActivityRecord_ArchiveAsBeneficiaryResult'
;

export declare const UnclaimedActivityRecord_ArchiveAsBeneficiaryResult:
  damlTypes.Serializable<UnclaimedActivityRecord_ArchiveAsBeneficiaryResult> & {
  }
& { readonly keys: UnclaimedActivityRecord_ArchiveAsBeneficiaryResult[] } & { readonly [e in UnclaimedActivityRecord_ArchiveAsBeneficiaryResult]: e }
;


export declare type SvRewardCoupon_ArchiveAsBeneficiaryResult =
  | 'SvRewardCoupon_ArchiveAsBeneficiaryResult'
;

export declare const SvRewardCoupon_ArchiveAsBeneficiaryResult:
  damlTypes.Serializable<SvRewardCoupon_ArchiveAsBeneficiaryResult> & {
  }
& { readonly keys: SvRewardCoupon_ArchiveAsBeneficiaryResult[] } & { readonly [e in SvRewardCoupon_ArchiveAsBeneficiaryResult]: e }
;


export declare type SvRewardCoupon_DsoExpireResult = {
  weight: damlTypes.Int;
};

export declare const SvRewardCoupon_DsoExpireResult:
  damlTypes.Serializable<SvRewardCoupon_DsoExpireResult> & {
  }
;


export declare type ValidatorRewardCoupon_ArchiveAsValidatorResult = {
};

export declare const ValidatorRewardCoupon_ArchiveAsValidatorResult:
  damlTypes.Serializable<ValidatorRewardCoupon_ArchiveAsValidatorResult> & {
  }
;


export declare type ValidatorRewardCoupon_DsoExpireResult = {
  amount: damlTypes.Numeric;
};

export declare const ValidatorRewardCoupon_DsoExpireResult:
  damlTypes.Serializable<ValidatorRewardCoupon_DsoExpireResult> & {
  }
;


export declare type AppRewardCoupon_DsoExpireResult = {
  featured: boolean;
  amount: damlTypes.Numeric;
};

export declare const AppRewardCoupon_DsoExpireResult:
  damlTypes.Serializable<AppRewardCoupon_DsoExpireResult> & {
  }
;


export declare type FeaturedAppRight_CancelResult =
  | 'FeaturedAppRight_CancelResult'
;

export declare const FeaturedAppRight_CancelResult:
  damlTypes.Serializable<FeaturedAppRight_CancelResult> & {
  }
& { readonly keys: FeaturedAppRight_CancelResult[] } & { readonly [e in FeaturedAppRight_CancelResult]: e }
;


export declare type FeaturedAppRight_WithdrawResult =
  | 'FeaturedAppRight_WithdrawResult'
;

export declare const FeaturedAppRight_WithdrawResult:
  damlTypes.Serializable<FeaturedAppRight_WithdrawResult> & {
  }
& { readonly keys: FeaturedAppRight_WithdrawResult[] } & { readonly [e in FeaturedAppRight_WithdrawResult]: e }
;


export declare type ValidatorRight_ArchiveAsUserResult =
  | 'ValidatorRight_ArchiveAsUserResult'
;

export declare const ValidatorRight_ArchiveAsUserResult:
  damlTypes.Serializable<ValidatorRight_ArchiveAsUserResult> & {
  }
& { readonly keys: ValidatorRight_ArchiveAsUserResult[] } & { readonly [e in ValidatorRight_ArchiveAsUserResult]: e }
;


export declare type ValidatorRight_ArchiveAsValidatorResult =
  | 'ValidatorRight_ArchiveAsValidatorResult'
;

export declare const ValidatorRight_ArchiveAsValidatorResult:
  damlTypes.Serializable<ValidatorRight_ArchiveAsValidatorResult> & {
  }
& { readonly keys: ValidatorRight_ArchiveAsValidatorResult[] } & { readonly [e in ValidatorRight_ArchiveAsValidatorResult]: e }
;


export declare type LockedAmulet_ExpireAmuletResult = {
  expireSum: AmuletExpireSummary;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const LockedAmulet_ExpireAmuletResult:
  damlTypes.Serializable<LockedAmulet_ExpireAmuletResult> & {
  }
;


export declare type LockedAmulet_OwnerExpireLockResult = {
  amuletSum: AmuletCreateSummary<damlTypes.ContractId<Amulet>>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const LockedAmulet_OwnerExpireLockResult:
  damlTypes.Serializable<LockedAmulet_OwnerExpireLockResult> & {
  }
;


export declare type LockedAmulet_UnlockResult = {
  amuletSum: AmuletCreateSummary<damlTypes.ContractId<Amulet>>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const LockedAmulet_UnlockResult:
  damlTypes.Serializable<LockedAmulet_UnlockResult> & {
  }
;


export declare type Amulet_ExpireResult = {
  expireSum: AmuletExpireSummary;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const Amulet_ExpireResult:
  damlTypes.Serializable<Amulet_ExpireResult> & {
  }
;


export declare type AmuletCreateSummary<amuletContractId> = {
  amulet: amuletContractId;
  amuletPrice: damlTypes.Numeric;
  round: Splice_Types.Round;
};

export declare const AmuletCreateSummary :
  (<amuletContractId>(amuletContractId: damlTypes.Serializable<amuletContractId>) => damlTypes.Serializable<AmuletCreateSummary<amuletContractId>>) & {
};


export declare type AmuletExpireSummary = {
  owner: damlTypes.Party;
  round: Splice_Types.Round;
  changeToInitialAmountAsOfRoundZero: damlTypes.Numeric;
  changeToHoldingFeesRate: damlTypes.Numeric;
};

export declare const AmuletExpireSummary:
  damlTypes.Serializable<AmuletExpireSummary> & {
  }
;

