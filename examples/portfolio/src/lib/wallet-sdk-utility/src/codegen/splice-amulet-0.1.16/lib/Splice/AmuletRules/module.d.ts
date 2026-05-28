// Generated from Splice/AmuletRules.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 from '@daml.js/daml-prim-DA-Types-1.0.0';
import * as pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda from '@daml.js/splice-api-featured-app-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946 from '@daml.js/daml-stdlib-DA-Time-Types-1.0.0';

import * as Splice_Amulet from '../../Splice/Amulet/module';
import * as Splice_AmuletConfig from '../../Splice/AmuletConfig/module';
import * as Splice_DecentralizedSynchronizer from '../../Splice/DecentralizedSynchronizer/module';
import * as Splice_Expiry from '../../Splice/Expiry/module';
import * as Splice_Issuance from '../../Splice/Issuance/module';
import * as Splice_Round from '../../Splice/Round/module';
import * as Splice_Schedule from '../../Splice/Schedule/module';
import * as Splice_Types from '../../Splice/Types/module';
import * as Splice_ValidatorLicense from '../../Splice/ValidatorLicense/module';

export declare type TransferPreapproval_CancelResult =
  | 'TransferPreapproval_CancelResult'
;

export declare const TransferPreapproval_CancelResult:
  damlTypes.Serializable<TransferPreapproval_CancelResult> & {
  }
& { readonly keys: TransferPreapproval_CancelResult[] } & { readonly [e in TransferPreapproval_CancelResult]: e }
;


export declare type TransferPreapproval_ExpireResult = {
};

export declare const TransferPreapproval_ExpireResult:
  damlTypes.Serializable<TransferPreapproval_ExpireResult> & {
  }
;


export declare type TransferPreapproval_RenewResult = {
  transferPreapprovalCid: damlTypes.ContractId<TransferPreapproval>;
  transferResult: TransferResult;
  receiver: damlTypes.Party;
  provider: damlTypes.Party;
  amuletPaid: damlTypes.Numeric;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const TransferPreapproval_RenewResult:
  damlTypes.Serializable<TransferPreapproval_RenewResult> & {
  }
;


export declare type TransferPreapproval_SendResult = {
  result: TransferResult;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const TransferPreapproval_SendResult:
  damlTypes.Serializable<TransferPreapproval_SendResult> & {
  }
;


export declare type TransferPreapproval_Cancel = {
  p: damlTypes.Party;
};

export declare const TransferPreapproval_Cancel:
  damlTypes.Serializable<TransferPreapproval_Cancel> & {
  }
;


export declare type TransferPreapproval_Expire = {
};

export declare const TransferPreapproval_Expire:
  damlTypes.Serializable<TransferPreapproval_Expire> & {
  }
;


export declare type TransferPreapproval_Renew = {
  context: PaymentTransferContext;
  inputs: TransferInput[];
  newExpiresAt: damlTypes.Time;
};

export declare const TransferPreapproval_Renew:
  damlTypes.Serializable<TransferPreapproval_Renew> & {
  }
;


export declare type TransferPreapproval_Send = {
  context: PaymentTransferContext;
  inputs: TransferInput[];
  amount: damlTypes.Numeric;
  sender: damlTypes.Party;
  description: damlTypes.Optional<string>;
};

export declare const TransferPreapproval_Send:
  damlTypes.Serializable<TransferPreapproval_Send> & {
  }
;


export declare type TransferPreapproval_Fetch = {
  p: damlTypes.Party;
};

export declare const TransferPreapproval_Fetch:
  damlTypes.Serializable<TransferPreapproval_Fetch> & {
  }
;


export declare type TransferPreapproval = {
  dso: damlTypes.Party;
  receiver: damlTypes.Party;
  provider: damlTypes.Party;
  validFrom: damlTypes.Time;
  lastRenewedAt: damlTypes.Time;
  expiresAt: damlTypes.Time;
};

export declare interface TransferPreapprovalInterface {
  TransferPreapproval_Renew: damlTypes.Choice<TransferPreapproval, TransferPreapproval_Renew, TransferPreapproval_RenewResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferPreapproval, undefined>>;
  TransferPreapproval_Send: damlTypes.Choice<TransferPreapproval, TransferPreapproval_Send, TransferPreapproval_SendResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferPreapproval, undefined>>;
  TransferPreapproval_Expire: damlTypes.Choice<TransferPreapproval, TransferPreapproval_Expire, TransferPreapproval_ExpireResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferPreapproval, undefined>>;
  TransferPreapproval_Cancel: damlTypes.Choice<TransferPreapproval, TransferPreapproval_Cancel, TransferPreapproval_CancelResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferPreapproval, undefined>>;
  Archive: damlTypes.Choice<TransferPreapproval, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferPreapproval, undefined>>;
  TransferPreapproval_Fetch: damlTypes.Choice<TransferPreapproval, TransferPreapproval_Fetch, TransferPreapproval, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferPreapproval, undefined>>;
}
export declare const TransferPreapproval:
  damlTypes.Template<TransferPreapproval, undefined, '#splice-amulet:Splice.AmuletRules:TransferPreapproval'> &
  damlTypes.ToInterface<TransferPreapproval, never> &
  TransferPreapprovalInterface;

export declare namespace TransferPreapproval {
}



export declare type ExternalPartySetupProposal_WithdrawResult = {
  dummyArg: {};
};

export declare const ExternalPartySetupProposal_WithdrawResult:
  damlTypes.Serializable<ExternalPartySetupProposal_WithdrawResult> & {
  }
;


export declare type ExternalPartySetupProposal_RejectResult = {
  dummyArg: {};
};

export declare const ExternalPartySetupProposal_RejectResult:
  damlTypes.Serializable<ExternalPartySetupProposal_RejectResult> & {
  }
;


export declare type ExternalPartySetupProposal_AcceptResult = {
  validatorRightCid: damlTypes.ContractId<Splice_Amulet.ValidatorRight>;
  transferPreapprovalCid: damlTypes.ContractId<TransferPreapproval>;
};

export declare const ExternalPartySetupProposal_AcceptResult:
  damlTypes.Serializable<ExternalPartySetupProposal_AcceptResult> & {
  }
;


export declare type ExternalPartySetupProposal_Withdraw = {
  reason: string;
};

export declare const ExternalPartySetupProposal_Withdraw:
  damlTypes.Serializable<ExternalPartySetupProposal_Withdraw> & {
  }
;


export declare type ExternalPartySetupProposal_Reject = {
  reason: string;
};

export declare const ExternalPartySetupProposal_Reject:
  damlTypes.Serializable<ExternalPartySetupProposal_Reject> & {
  }
;


export declare type ExternalPartySetupProposal_Accept = {
};

export declare const ExternalPartySetupProposal_Accept:
  damlTypes.Serializable<ExternalPartySetupProposal_Accept> & {
  }
;


export declare type ExternalPartySetupProposal = {
  validator: damlTypes.Party;
  user: damlTypes.Party;
  dso: damlTypes.Party;
  createdAt: damlTypes.Time;
  preapprovalExpiresAt: damlTypes.Time;
};

export declare interface ExternalPartySetupProposalInterface {
  ExternalPartySetupProposal_Accept: damlTypes.Choice<ExternalPartySetupProposal, ExternalPartySetupProposal_Accept, ExternalPartySetupProposal_AcceptResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExternalPartySetupProposal, undefined>>;
  Archive: damlTypes.Choice<ExternalPartySetupProposal, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExternalPartySetupProposal, undefined>>;
  ExternalPartySetupProposal_Reject: damlTypes.Choice<ExternalPartySetupProposal, ExternalPartySetupProposal_Reject, ExternalPartySetupProposal_RejectResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExternalPartySetupProposal, undefined>>;
  ExternalPartySetupProposal_Withdraw: damlTypes.Choice<ExternalPartySetupProposal, ExternalPartySetupProposal_Withdraw, ExternalPartySetupProposal_WithdrawResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExternalPartySetupProposal, undefined>>;
}
export declare const ExternalPartySetupProposal:
  damlTypes.Template<ExternalPartySetupProposal, undefined, '#splice-amulet:Splice.AmuletRules:ExternalPartySetupProposal'> &
  damlTypes.ToInterface<ExternalPartySetupProposal, never> &
  ExternalPartySetupProposalInterface;

export declare namespace ExternalPartySetupProposal {
}



export declare type BalanceChange = {
  changeToInitialAmountAsOfRoundZero: damlTypes.Numeric;
  changeToHoldingFeesRate: damlTypes.Numeric;
};

export declare const BalanceChange:
  damlTypes.Serializable<BalanceChange> & {
  }
;


export declare type TransferSummary = {
  inputAppRewardAmount: damlTypes.Numeric;
  inputValidatorRewardAmount: damlTypes.Numeric;
  inputSvRewardAmount: damlTypes.Numeric;
  inputAmuletAmount: damlTypes.Numeric;
  balanceChanges: damlTypes.Map<damlTypes.Party, BalanceChange>;
  holdingFees: damlTypes.Numeric;
  outputFees: damlTypes.Numeric[];
  senderChangeFee: damlTypes.Numeric;
  senderChangeAmount: damlTypes.Numeric;
  amuletPrice: damlTypes.Numeric;
  inputValidatorFaucetAmount: damlTypes.Optional<damlTypes.Numeric>;
  inputUnclaimedActivityRecordAmount: damlTypes.Optional<damlTypes.Numeric>;
  inputDevelopmentFundAmount: damlTypes.Optional<damlTypes.Numeric>;
};

export declare const TransferSummary:
  damlTypes.Serializable<TransferSummary> & {
  }
;


export declare type AmuletRules_CreateTransferPreapprovalResult = {
  transferPreapprovalCid: damlTypes.ContractId<TransferPreapproval>;
  transferResult: TransferResult;
  amuletPaid: damlTypes.Numeric;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const AmuletRules_CreateTransferPreapprovalResult:
  damlTypes.Serializable<AmuletRules_CreateTransferPreapprovalResult> & {
  }
;


export declare type AmuletRules_CreateExternalPartySetupProposalResult = {
  proposalCid: damlTypes.ContractId<ExternalPartySetupProposal>;
  user: damlTypes.Party;
  validator: damlTypes.Party;
  transferResult: TransferResult;
  amuletPaid: damlTypes.Numeric;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const AmuletRules_CreateExternalPartySetupProposalResult:
  damlTypes.Serializable<AmuletRules_CreateExternalPartySetupProposalResult> & {
  }
;


export declare type AmuletRules_BuyMemberTrafficResult = {
  round: Splice_Types.Round;
  summary: TransferSummary;
  amuletPaid: damlTypes.Numeric;
  purchasedTraffic: damlTypes.ContractId<Splice_DecentralizedSynchronizer.MemberTraffic>;
  senderChangeAmulet: damlTypes.Optional<damlTypes.ContractId<Splice_Amulet.Amulet>>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const AmuletRules_BuyMemberTrafficResult:
  damlTypes.Serializable<AmuletRules_BuyMemberTrafficResult> & {
  }
;


export declare type TransferResult = {
  round: Splice_Types.Round;
  summary: TransferSummary;
  createdAmulets: CreatedAmulet[];
  senderChangeAmulet: damlTypes.Optional<damlTypes.ContractId<Splice_Amulet.Amulet>>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const TransferResult:
  damlTypes.Serializable<TransferResult> & {
  }
;


export declare type TransferOutput = {
  receiver: damlTypes.Party;
  receiverFeeRatio: damlTypes.Numeric;
  amount: damlTypes.Numeric;
  lock: damlTypes.Optional<Splice_Expiry.TimeLock>;
};

export declare const TransferOutput:
  damlTypes.Serializable<TransferOutput> & {
  }
;


export declare type Transfer = {
  sender: damlTypes.Party;
  provider: damlTypes.Party;
  inputs: TransferInput[];
  outputs: TransferOutput[];
  beneficiaries: damlTypes.Optional<pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary[]>;
};

export declare const Transfer:
  damlTypes.Serializable<Transfer> & {
  }
;


export declare type TransferInput =
  |  { tag: 'InputAppRewardCoupon'; value: damlTypes.ContractId<Splice_Amulet.AppRewardCoupon> }
  |  { tag: 'InputValidatorRewardCoupon'; value: damlTypes.ContractId<Splice_Amulet.ValidatorRewardCoupon> }
  |  { tag: 'InputSvRewardCoupon'; value: damlTypes.ContractId<Splice_Amulet.SvRewardCoupon> }
  |  { tag: 'InputAmulet'; value: damlTypes.ContractId<Splice_Amulet.Amulet> }
  |  { tag: 'ExtTransferInput'; value: TransferInput.ExtTransferInput }
  |  { tag: 'InputValidatorLivenessActivityRecord'; value: damlTypes.ContractId<Splice_ValidatorLicense.ValidatorLivenessActivityRecord> }
  |  { tag: 'InputUnclaimedActivityRecord'; value: damlTypes.ContractId<Splice_Amulet.UnclaimedActivityRecord> }
  |  { tag: 'InputDevelopmentFundCoupon'; value: damlTypes.ContractId<Splice_Amulet.DevelopmentFundCoupon> }
;

export declare const TransferInput:
  damlTypes.Serializable<TransferInput> & {
  ExtTransferInput: damlTypes.Serializable<TransferInput.ExtTransferInput>;
  }
;


export namespace TransferInput {
  type ExtTransferInput = {
    dummyUnitField: {};
    optInputValidatorFaucetCoupon: damlTypes.Optional<damlTypes.ContractId<Splice_ValidatorLicense.ValidatorFaucetCoupon>>;
  };
} //namespace TransferInput


export declare type CreatedAmulet =
  |  { tag: 'TransferResultAmulet'; value: damlTypes.ContractId<Splice_Amulet.Amulet> }
  |  { tag: 'TransferResultLockedAmulet'; value: damlTypes.ContractId<Splice_Amulet.LockedAmulet> }
  |  { tag: 'ExtCreatedAmulet'; value: CreatedAmulet.ExtCreatedAmulet }
;

export declare const CreatedAmulet:
  damlTypes.Serializable<CreatedAmulet> & {
  ExtCreatedAmulet: damlTypes.Serializable<CreatedAmulet.ExtCreatedAmulet>;
  }
;


export namespace CreatedAmulet {
  type ExtCreatedAmulet = {
    dummyUnitField: {};
  };
} //namespace CreatedAmulet


export declare type TransferContext = {
  openMiningRound: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
  issuingMiningRounds: damlTypes.Map<Splice_Types.Round, damlTypes.ContractId<Splice_Round.IssuingMiningRound>>;
  validatorRights: damlTypes.Map<damlTypes.Party, damlTypes.ContractId<Splice_Amulet.ValidatorRight>>;
  featuredAppRight: damlTypes.Optional<damlTypes.ContractId<Splice_Amulet.FeaturedAppRight>>;
};

export declare const TransferContext:
  damlTypes.Serializable<TransferContext> & {
  }
;


export declare type PaymentTransferContext = {
  amuletRules: damlTypes.ContractId<AmuletRules>;
  context: TransferContext;
};

export declare const PaymentTransferContext:
  damlTypes.Serializable<PaymentTransferContext> & {
  }
;


export declare type AppTransferContext = {
  amuletRules: damlTypes.ContractId<AmuletRules>;
  openMiningRound: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
  featuredAppRight: damlTypes.Optional<damlTypes.ContractId<Splice_Amulet.FeaturedAppRight>>;
};

export declare const AppTransferContext:
  damlTypes.Serializable<AppTransferContext> & {
  }
;


export declare type PreprocessedTransferOutput = {
  owner: damlTypes.Party;
  outputFee: damlTypes.Numeric;
  amount: damlTypes.Numeric;
  lock: damlTypes.Optional<Splice_Expiry.TimeLock>;
};

export declare const PreprocessedTransferOutput:
  damlTypes.Serializable<PreprocessedTransferOutput> & {
  }
;


export declare type TransferInputsSummary = {
  totalAmuletAmount: damlTypes.Numeric;
  totalAppRewardAmount: damlTypes.Numeric;
  totalValidatorRewardAmount: damlTypes.Numeric;
  totalValidatorFaucetAmount: damlTypes.Numeric;
  totalSvRewardAmount: damlTypes.Numeric;
  totalHoldingFees: damlTypes.Numeric;
  amountArchivedAsOfRoundZero: damlTypes.Numeric;
  changeToHoldingFeesRate: damlTypes.Numeric;
  totalUnclaimedActivityRecordAmount: damlTypes.Optional<damlTypes.Numeric>;
  totalDevelopmentFundAmount: damlTypes.Optional<damlTypes.Numeric>;
};

export declare const TransferInputsSummary:
  damlTypes.Serializable<TransferInputsSummary> & {
  }
;


export declare type TransferContextSummary = {
  featuredAppProvider: damlTypes.Optional<damlTypes.Party>;
  config: Splice_AmuletConfig.TransferConfig<Splice_Amulet.Amulet>;
  openRound: Splice_Round.OpenMiningRound;
  issuingMiningRounds: damlTypes.Map<Splice_Types.Round, Splice_Round.IssuingMiningRound>;
  validatorRights: damlTypes.Map<damlTypes.Party, damlTypes.ContractId<Splice_Amulet.ValidatorRight>>;
};

export declare const TransferContextSummary:
  damlTypes.Serializable<TransferContextSummary> & {
  }
;


export declare type RewardsIssuanceConfig = {
  issueAppRewards: boolean;
  issueValidatorRewards: boolean;
};

export declare const RewardsIssuanceConfig:
  damlTypes.Serializable<RewardsIssuanceConfig> & {
  }
;


export declare type InvalidTransfer = {
  reason: InvalidTransferReason;
};

export declare const InvalidTransfer:
  damlTypes.Serializable<InvalidTransfer> & {
  }
;


export declare type InvalidTransferReason =
  |  { tag: 'ITR_InsufficientFunds'; value: InvalidTransferReason.ITR_InsufficientFunds }
  |  { tag: 'ITR_UnknownSynchronizer'; value: InvalidTransferReason.ITR_UnknownSynchronizer }
  |  { tag: 'ITR_InsufficientTopupAmount'; value: InvalidTransferReason.ITR_InsufficientTopupAmount }
  |  { tag: 'ITR_Other'; value: InvalidTransferReason.ITR_Other }
  |  { tag: 'ExtInvalidTransferReason'; value: InvalidTransferReason.ExtInvalidTransferReason }
;

export declare const InvalidTransferReason:
  damlTypes.Serializable<InvalidTransferReason> & {
  ITR_InsufficientFunds: damlTypes.Serializable<InvalidTransferReason.ITR_InsufficientFunds>;
  ITR_UnknownSynchronizer: damlTypes.Serializable<InvalidTransferReason.ITR_UnknownSynchronizer>;
  ITR_InsufficientTopupAmount: damlTypes.Serializable<InvalidTransferReason.ITR_InsufficientTopupAmount>;
  ITR_Other: damlTypes.Serializable<InvalidTransferReason.ITR_Other>;
  ExtInvalidTransferReason: damlTypes.Serializable<InvalidTransferReason.ExtInvalidTransferReason>;
  }
;


export namespace InvalidTransferReason {
  type ITR_InsufficientFunds = {
    missingAmount: damlTypes.Numeric;
  };
} //namespace InvalidTransferReason


export namespace InvalidTransferReason {
  type ITR_UnknownSynchronizer = {
    synchronizerId: string;
  };
} //namespace InvalidTransferReason


export namespace InvalidTransferReason {
  type ITR_InsufficientTopupAmount = {
    requestedTopupAmount: damlTypes.Int;
    minTopupAmount: damlTypes.Int;
  };
} //namespace InvalidTransferReason


export namespace InvalidTransferReason {
  type ITR_Other = {
    description: string;
  };
} //namespace InvalidTransferReason


export namespace InvalidTransferReason {
  type ExtInvalidTransferReason = {
    dummyUnitField: {};
  };
} //namespace InvalidTransferReason


export declare type AmuletRules_ConvertFeaturedAppActivityMarkers = {
  markerCids: damlTypes.ContractId<Splice_Amulet.FeaturedAppActivityMarker>[];
  openMiningRoundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
  observers: damlTypes.Optional<damlTypes.Party[]>;
};

export declare const AmuletRules_ConvertFeaturedAppActivityMarkers:
  damlTypes.Serializable<AmuletRules_ConvertFeaturedAppActivityMarkers> & {
  }
;


export declare type AmuletRules_UpdateFutureAmuletConfigSchedule = {
  scheduleItem: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.Time, Splice_AmuletConfig.AmuletConfig<Splice_AmuletConfig.USD>>;
};

export declare const AmuletRules_UpdateFutureAmuletConfigSchedule:
  damlTypes.Serializable<AmuletRules_UpdateFutureAmuletConfigSchedule> & {
  }
;


export declare type AmuletRules_RemoveFutureAmuletConfigSchedule = {
  scheduleTime: damlTypes.Time;
};

export declare const AmuletRules_RemoveFutureAmuletConfigSchedule:
  damlTypes.Serializable<AmuletRules_RemoveFutureAmuletConfigSchedule> & {
  }
;


export declare type AmuletRules_AddFutureAmuletConfigSchedule = {
  newScheduleItem: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.Time, Splice_AmuletConfig.AmuletConfig<Splice_AmuletConfig.USD>>;
};

export declare const AmuletRules_AddFutureAmuletConfigSchedule:
  damlTypes.Serializable<AmuletRules_AddFutureAmuletConfigSchedule> & {
  }
;


export declare type AmuletRules_SetConfig = {
  newConfig: Splice_AmuletConfig.AmuletConfig<Splice_AmuletConfig.USD>;
  baseConfig: Splice_AmuletConfig.AmuletConfig<Splice_AmuletConfig.USD>;
};

export declare const AmuletRules_SetConfig:
  damlTypes.Serializable<AmuletRules_SetConfig> & {
  }
;


export declare type AmuletRules_Fetch = {
  p: damlTypes.Party;
};

export declare const AmuletRules_Fetch:
  damlTypes.Serializable<AmuletRules_Fetch> & {
  }
;


export declare type AmuletRules_AllocateDevelopmentFundCoupon = {
  unclaimedDevelopmentFundCouponCids: damlTypes.ContractId<Splice_Amulet.UnclaimedDevelopmentFundCoupon>[];
  beneficiary: damlTypes.Party;
  amount: damlTypes.Numeric;
  expiresAt: damlTypes.Time;
  reason: string;
  fundManager: damlTypes.Party;
};

export declare const AmuletRules_AllocateDevelopmentFundCoupon:
  damlTypes.Serializable<AmuletRules_AllocateDevelopmentFundCoupon> & {
  }
;


export declare type AmuletRules_MergeUnclaimedDevelopmentFundCoupons = {
  unclaimedDevelopmentFundCouponCids: damlTypes.ContractId<Splice_Amulet.UnclaimedDevelopmentFundCoupon>[];
};

export declare const AmuletRules_MergeUnclaimedDevelopmentFundCoupons:
  damlTypes.Serializable<AmuletRules_MergeUnclaimedDevelopmentFundCoupons> & {
  }
;


export declare type AmuletRules_MergeUnclaimedRewards = {
  unclaimedRewardCids: damlTypes.ContractId<Splice_Amulet.UnclaimedReward>[];
};

export declare const AmuletRules_MergeUnclaimedRewards:
  damlTypes.Serializable<AmuletRules_MergeUnclaimedRewards> & {
  }
;


export declare type AmuletRules_ClaimExpiredRewards = {
  closedRoundCid: damlTypes.ContractId<Splice_Round.ClosedMiningRound>;
  validatorRewardCouponCids: damlTypes.ContractId<Splice_Amulet.ValidatorRewardCoupon>[];
  appCouponCids: damlTypes.ContractId<Splice_Amulet.AppRewardCoupon>[];
  svRewardCouponCids: damlTypes.ContractId<Splice_Amulet.SvRewardCoupon>[];
  optValidatorFaucetCouponCids: damlTypes.Optional<damlTypes.ContractId<Splice_ValidatorLicense.ValidatorFaucetCoupon>[]>;
  optValidatorLivenessActivityRecordCids: damlTypes.Optional<damlTypes.ContractId<Splice_ValidatorLicense.ValidatorLivenessActivityRecord>[]>;
};

export declare const AmuletRules_ClaimExpiredRewards:
  damlTypes.Serializable<AmuletRules_ClaimExpiredRewards> & {
  }
;


export declare type AmuletRules_MiningRound_Archive = {
  closedRoundCid: damlTypes.ContractId<Splice_Round.ClosedMiningRound>;
};

export declare const AmuletRules_MiningRound_Archive:
  damlTypes.Serializable<AmuletRules_MiningRound_Archive> & {
  }
;


export declare type AmuletRules_MiningRound_Close = {
  issuingRoundCid: damlTypes.ContractId<Splice_Round.IssuingMiningRound>;
};

export declare const AmuletRules_MiningRound_Close:
  damlTypes.Serializable<AmuletRules_MiningRound_Close> & {
  }
;


export declare type AmuletRules_MiningRound_StartIssuing = {
  miningRoundCid: damlTypes.ContractId<Splice_Round.SummarizingMiningRound>;
  summary: Splice_Issuance.OpenMiningRoundSummary;
};

export declare const AmuletRules_MiningRound_StartIssuing:
  damlTypes.Serializable<AmuletRules_MiningRound_StartIssuing> & {
  }
;


export declare type AmuletRules_AdvanceOpenMiningRounds = {
  amuletPrice: damlTypes.Numeric;
  roundToArchiveCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
  middleRoundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
  latestRoundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const AmuletRules_AdvanceOpenMiningRounds:
  damlTypes.Serializable<AmuletRules_AdvanceOpenMiningRounds> & {
  }
;


export declare type AmuletRules_Bootstrap_Rounds = {
  amuletPrice: damlTypes.Numeric;
  round0Duration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime;
  initialRound: damlTypes.Optional<damlTypes.Int>;
};

export declare const AmuletRules_Bootstrap_Rounds:
  damlTypes.Serializable<AmuletRules_Bootstrap_Rounds> & {
  }
;


export declare type AmuletRules_DevNet_FeatureApp = {
  provider: damlTypes.Party;
};

export declare const AmuletRules_DevNet_FeatureApp:
  damlTypes.Serializable<AmuletRules_DevNet_FeatureApp> & {
  }
;


export declare type AmuletRules_DevNet_Tap = {
  receiver: damlTypes.Party;
  amount: damlTypes.Numeric;
  openRound: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const AmuletRules_DevNet_Tap:
  damlTypes.Serializable<AmuletRules_DevNet_Tap> & {
  }
;


export declare type AmuletRules_Mint = {
  receiver: damlTypes.Party;
  amount: damlTypes.Numeric;
  openRound: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const AmuletRules_Mint:
  damlTypes.Serializable<AmuletRules_Mint> & {
  }
;


export declare type AmuletRules_MergeMemberTrafficContracts = {
  trafficCids: damlTypes.ContractId<Splice_DecentralizedSynchronizer.MemberTraffic>[];
};

export declare const AmuletRules_MergeMemberTrafficContracts:
  damlTypes.Serializable<AmuletRules_MergeMemberTrafficContracts> & {
  }
;


export declare type AmuletRules_BuyMemberTraffic = {
  inputs: TransferInput[];
  context: TransferContext;
  provider: damlTypes.Party;
  memberId: string;
  synchronizerId: string;
  migrationId: damlTypes.Int;
  trafficAmount: damlTypes.Int;
  expectedDso: damlTypes.Optional<damlTypes.Party>;
};

export declare const AmuletRules_BuyMemberTraffic:
  damlTypes.Serializable<AmuletRules_BuyMemberTraffic> & {
  }
;


export declare type AmuletRules_CreateTransferPreapproval = {
  context: PaymentTransferContext;
  inputs: TransferInput[];
  receiver: damlTypes.Party;
  provider: damlTypes.Party;
  expiresAt: damlTypes.Time;
  expectedDso: damlTypes.Optional<damlTypes.Party>;
};

export declare const AmuletRules_CreateTransferPreapproval:
  damlTypes.Serializable<AmuletRules_CreateTransferPreapproval> & {
  }
;


export declare type AmuletRules_CreateExternalPartySetupProposal = {
  context: PaymentTransferContext;
  inputs: TransferInput[];
  user: damlTypes.Party;
  validator: damlTypes.Party;
  preapprovalExpiresAt: damlTypes.Time;
  expectedDso: damlTypes.Optional<damlTypes.Party>;
};

export declare const AmuletRules_CreateExternalPartySetupProposal:
  damlTypes.Serializable<AmuletRules_CreateExternalPartySetupProposal> & {
  }
;


export declare type AmuletRules_Transfer = {
  transfer: Transfer;
  context: TransferContext;
  expectedDso: damlTypes.Optional<damlTypes.Party>;
};

export declare const AmuletRules_Transfer:
  damlTypes.Serializable<AmuletRules_Transfer> & {
  }
;


export declare type AmuletRules_ComputeFees = {
  context: TransferContext;
  sender: damlTypes.Party;
  outputs: TransferOutput[];
  expectedDso: damlTypes.Optional<damlTypes.Party>;
};

export declare const AmuletRules_ComputeFees:
  damlTypes.Serializable<AmuletRules_ComputeFees> & {
  }
;


export declare type AmuletRules = {
  dso: damlTypes.Party;
  configSchedule: Splice_Schedule.Schedule<damlTypes.Time, Splice_AmuletConfig.AmuletConfig<Splice_AmuletConfig.USD>>;
  isDevNet: boolean;
};

export declare interface AmuletRulesInterface {
  AmuletRules_ComputeFees: damlTypes.Choice<AmuletRules, AmuletRules_ComputeFees, AmuletRules_ComputeFeesResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_Transfer: damlTypes.Choice<AmuletRules, AmuletRules_Transfer, TransferResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_CreateExternalPartySetupProposal: damlTypes.Choice<AmuletRules, AmuletRules_CreateExternalPartySetupProposal, AmuletRules_CreateExternalPartySetupProposalResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_CreateTransferPreapproval: damlTypes.Choice<AmuletRules, AmuletRules_CreateTransferPreapproval, AmuletRules_CreateTransferPreapprovalResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_BuyMemberTraffic: damlTypes.Choice<AmuletRules, AmuletRules_BuyMemberTraffic, AmuletRules_BuyMemberTrafficResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_MergeMemberTrafficContracts: damlTypes.Choice<AmuletRules, AmuletRules_MergeMemberTrafficContracts, AmuletRules_MergeMemberTrafficContractsResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_Mint: damlTypes.Choice<AmuletRules, AmuletRules_Mint, AmuletRules_MintResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_DevNet_Tap: damlTypes.Choice<AmuletRules, AmuletRules_DevNet_Tap, AmuletRules_DevNet_TapResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_DevNet_FeatureApp: damlTypes.Choice<AmuletRules, AmuletRules_DevNet_FeatureApp, AmuletRules_DevNet_FeatureAppResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_Bootstrap_Rounds: damlTypes.Choice<AmuletRules, AmuletRules_Bootstrap_Rounds, AmuletRules_Bootstrap_RoundsResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_AdvanceOpenMiningRounds: damlTypes.Choice<AmuletRules, AmuletRules_AdvanceOpenMiningRounds, AmuletRules_AdvanceOpenMiningRoundsResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_MiningRound_StartIssuing: damlTypes.Choice<AmuletRules, AmuletRules_MiningRound_StartIssuing, AmuletRules_MiningRound_StartIssuingResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_MiningRound_Close: damlTypes.Choice<AmuletRules, AmuletRules_MiningRound_Close, AmuletRules_MiningRound_CloseResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_MiningRound_Archive: damlTypes.Choice<AmuletRules, AmuletRules_MiningRound_Archive, AmuletRules_MiningRound_ArchiveResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_ClaimExpiredRewards: damlTypes.Choice<AmuletRules, AmuletRules_ClaimExpiredRewards, AmuletRules_ClaimExpiredRewardsResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_MergeUnclaimedRewards: damlTypes.Choice<AmuletRules, AmuletRules_MergeUnclaimedRewards, AmuletRules_MergeUnclaimedRewardsResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_MergeUnclaimedDevelopmentFundCoupons: damlTypes.Choice<AmuletRules, AmuletRules_MergeUnclaimedDevelopmentFundCoupons, AmuletRules_MergeUnclaimedDevelopmentFundCouponsResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_AllocateDevelopmentFundCoupon: damlTypes.Choice<AmuletRules, AmuletRules_AllocateDevelopmentFundCoupon, AmuletRules_AllocateDevelopmentFundCouponResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_SetConfig: damlTypes.Choice<AmuletRules, AmuletRules_SetConfig, AmuletRules_SetConfigResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_ConvertFeaturedAppActivityMarkers: damlTypes.Choice<AmuletRules, AmuletRules_ConvertFeaturedAppActivityMarkers, AmuletRules_ConvertFeaturedAppActivityMarkersResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  Archive: damlTypes.Choice<AmuletRules, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_Fetch: damlTypes.Choice<AmuletRules, AmuletRules_Fetch, AmuletRules, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_AddFutureAmuletConfigSchedule: damlTypes.Choice<AmuletRules, AmuletRules_AddFutureAmuletConfigSchedule, AmuletRules_AddFutureAmuletConfigScheduleResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_RemoveFutureAmuletConfigSchedule: damlTypes.Choice<AmuletRules, AmuletRules_RemoveFutureAmuletConfigSchedule, AmuletRules_RemoveFutureAmuletConfigScheduleResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
  AmuletRules_UpdateFutureAmuletConfigSchedule: damlTypes.Choice<AmuletRules, AmuletRules_UpdateFutureAmuletConfigSchedule, AmuletRules_UpdateFutureAmuletConfigScheduleResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletRules, undefined>>;
}
export declare const AmuletRules:
  damlTypes.Template<AmuletRules, undefined, '#splice-amulet:Splice.AmuletRules:AmuletRules'> &
  damlTypes.ToInterface<AmuletRules, never> &
  AmuletRulesInterface;

export declare namespace AmuletRules {
}



export declare type AmuletRules_ConvertFeaturedAppActivityMarkersResult = {
  appRewardCouponCids: damlTypes.ContractId<Splice_Amulet.AppRewardCoupon>[];
};

export declare const AmuletRules_ConvertFeaturedAppActivityMarkersResult:
  damlTypes.Serializable<AmuletRules_ConvertFeaturedAppActivityMarkersResult> & {
  }
;


export declare type AmuletRules_UpdateFutureAmuletConfigScheduleResult = {
  newAmuletRules: damlTypes.ContractId<AmuletRules>;
};

export declare const AmuletRules_UpdateFutureAmuletConfigScheduleResult:
  damlTypes.Serializable<AmuletRules_UpdateFutureAmuletConfigScheduleResult> & {
  }
;


export declare type AmuletRules_RemoveFutureAmuletConfigScheduleResult = {
  newAmuletRules: damlTypes.ContractId<AmuletRules>;
};

export declare const AmuletRules_RemoveFutureAmuletConfigScheduleResult:
  damlTypes.Serializable<AmuletRules_RemoveFutureAmuletConfigScheduleResult> & {
  }
;


export declare type AmuletRules_AddFutureAmuletConfigScheduleResult = {
  newAmuletRules: damlTypes.ContractId<AmuletRules>;
};

export declare const AmuletRules_AddFutureAmuletConfigScheduleResult:
  damlTypes.Serializable<AmuletRules_AddFutureAmuletConfigScheduleResult> & {
  }
;


export declare type AmuletRules_SetConfigResult = {
  newAmuletRules: damlTypes.ContractId<AmuletRules>;
};

export declare const AmuletRules_SetConfigResult:
  damlTypes.Serializable<AmuletRules_SetConfigResult> & {
  }
;


export declare type AmuletRules_AllocateDevelopmentFundCouponResult = {
  developmentFundCouponCid: damlTypes.ContractId<Splice_Amulet.DevelopmentFundCoupon>;
  optUnclaimedDevelopmentFundCouponCid: damlTypes.Optional<damlTypes.ContractId<Splice_Amulet.UnclaimedDevelopmentFundCoupon>>;
};

export declare const AmuletRules_AllocateDevelopmentFundCouponResult:
  damlTypes.Serializable<AmuletRules_AllocateDevelopmentFundCouponResult> & {
  }
;


export declare type AmuletRules_MergeUnclaimedDevelopmentFundCouponsResult = {
  unclaimedDevelopmentFundCouponCid: damlTypes.ContractId<Splice_Amulet.UnclaimedDevelopmentFundCoupon>;
};

export declare const AmuletRules_MergeUnclaimedDevelopmentFundCouponsResult:
  damlTypes.Serializable<AmuletRules_MergeUnclaimedDevelopmentFundCouponsResult> & {
  }
;


export declare type AmuletRules_MergeUnclaimedRewardsResult = {
  unclaimedRewardCid: damlTypes.ContractId<Splice_Amulet.UnclaimedReward>;
};

export declare const AmuletRules_MergeUnclaimedRewardsResult:
  damlTypes.Serializable<AmuletRules_MergeUnclaimedRewardsResult> & {
  }
;


export declare type AmuletRules_ClaimExpiredRewardsResult = {
  unclaimedRewardCid: damlTypes.Optional<damlTypes.ContractId<Splice_Amulet.UnclaimedReward>>;
};

export declare const AmuletRules_ClaimExpiredRewardsResult:
  damlTypes.Serializable<AmuletRules_ClaimExpiredRewardsResult> & {
  }
;


export declare type AmuletRules_MiningRound_ArchiveResult =
  | 'AmuletRules_MiningRound_ArchiveResult'
;

export declare const AmuletRules_MiningRound_ArchiveResult:
  damlTypes.Serializable<AmuletRules_MiningRound_ArchiveResult> & {
  }
& { readonly keys: AmuletRules_MiningRound_ArchiveResult[] } & { readonly [e in AmuletRules_MiningRound_ArchiveResult]: e }
;


export declare type AmuletRules_MiningRound_CloseResult = {
  closedRoundCid: damlTypes.ContractId<Splice_Round.ClosedMiningRound>;
};

export declare const AmuletRules_MiningRound_CloseResult:
  damlTypes.Serializable<AmuletRules_MiningRound_CloseResult> & {
  }
;


export declare type AmuletRules_MiningRound_StartIssuingResult = {
  issuingRoundCid: damlTypes.ContractId<Splice_Round.IssuingMiningRound>;
  unclaimedDevelopmentFundCouponCid: damlTypes.Optional<damlTypes.ContractId<Splice_Amulet.UnclaimedDevelopmentFundCoupon>>;
};

export declare const AmuletRules_MiningRound_StartIssuingResult:
  damlTypes.Serializable<AmuletRules_MiningRound_StartIssuingResult> & {
  }
;


export declare type AmuletRules_AdvanceOpenMiningRoundsResult = {
  summarizingRoundCid: damlTypes.ContractId<Splice_Round.SummarizingMiningRound>;
  openRoundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
};

export declare const AmuletRules_AdvanceOpenMiningRoundsResult:
  damlTypes.Serializable<AmuletRules_AdvanceOpenMiningRoundsResult> & {
  }
;


export declare type AmuletRules_Bootstrap_RoundsResult = {
  openMiningRoundCid: damlTypes.ContractId<Splice_Round.OpenMiningRound>;
  initialRound: damlTypes.Optional<Splice_Types.Round>;
};

export declare const AmuletRules_Bootstrap_RoundsResult:
  damlTypes.Serializable<AmuletRules_Bootstrap_RoundsResult> & {
  }
;


export declare type AmuletRules_DevNet_FeatureAppResult = {
  featuredAppRightCid: damlTypes.ContractId<Splice_Amulet.FeaturedAppRight>;
};

export declare const AmuletRules_DevNet_FeatureAppResult:
  damlTypes.Serializable<AmuletRules_DevNet_FeatureAppResult> & {
  }
;


export declare type AmuletRules_DevNet_TapResult = {
  amuletSum: Splice_Amulet.AmuletCreateSummary<damlTypes.ContractId<Splice_Amulet.Amulet>>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const AmuletRules_DevNet_TapResult:
  damlTypes.Serializable<AmuletRules_DevNet_TapResult> & {
  }
;


export declare type AmuletRules_MintResult = {
  amuletSum: Splice_Amulet.AmuletCreateSummary<damlTypes.ContractId<Splice_Amulet.Amulet>>;
};

export declare const AmuletRules_MintResult:
  damlTypes.Serializable<AmuletRules_MintResult> & {
  }
;


export declare type AmuletRules_MergeMemberTrafficContractsResult = {
  mergedTrafficCid: damlTypes.ContractId<Splice_DecentralizedSynchronizer.MemberTraffic>;
};

export declare const AmuletRules_MergeMemberTrafficContractsResult:
  damlTypes.Serializable<AmuletRules_MergeMemberTrafficContractsResult> & {
  }
;


export declare type AmuletRules_ComputeFeesResult = {
  fees: damlTypes.Numeric[];
};

export declare const AmuletRules_ComputeFeesResult:
  damlTypes.Serializable<AmuletRules_ComputeFeesResult> & {
  }
;

