// Generated from Splice/Issuance.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

export declare type IssuanceTranche = {
  rewardsToIssue: damlTypes.Numeric;
  issuancePerCoupon: damlTypes.Numeric;
  unclaimedRewards: damlTypes.Numeric;
};

export declare const IssuanceTranche:
  damlTypes.Serializable<IssuanceTranche> & {
  }
;


export declare type IssuingRoundParameters = {
  issuancePerValidatorRewardCoupon: damlTypes.Numeric;
  issuancePerFeaturedAppRewardCoupon: damlTypes.Numeric;
  issuancePerUnfeaturedAppRewardCoupon: damlTypes.Numeric;
  issuancePerSvRewardCoupon: damlTypes.Numeric;
  unclaimedAppRewards: damlTypes.Numeric;
  unclaimedValidatorRewards: damlTypes.Numeric;
  unclaimedSvRewards: damlTypes.Numeric;
  issuancePerValidatorFaucetCoupon: damlTypes.Numeric;
  optAmuletsToIssueToDevelopmentFund: damlTypes.Optional<damlTypes.Numeric>;
};

export declare const IssuingRoundParameters:
  damlTypes.Serializable<IssuingRoundParameters> & {
  }
;


export declare type OpenMiningRoundSummary = {
  totalValidatorRewardCoupons: damlTypes.Numeric;
  totalFeaturedAppRewardCoupons: damlTypes.Numeric;
  totalUnfeaturedAppRewardCoupons: damlTypes.Numeric;
  totalSvRewardWeight: damlTypes.Int;
  optTotalValidatorFaucetCoupons: damlTypes.Optional<damlTypes.Int>;
};

export declare const OpenMiningRoundSummary:
  damlTypes.Serializable<OpenMiningRoundSummary> & {
  }
;


export declare type IssuanceConfig = {
  amuletToIssuePerYear: damlTypes.Numeric;
  validatorRewardPercentage: damlTypes.Numeric;
  appRewardPercentage: damlTypes.Numeric;
  validatorRewardCap: damlTypes.Numeric;
  featuredAppRewardCap: damlTypes.Numeric;
  unfeaturedAppRewardCap: damlTypes.Numeric;
  optValidatorFaucetCap: damlTypes.Optional<damlTypes.Numeric>;
  optDevelopmentFundPercentage: damlTypes.Optional<damlTypes.Numeric>;
};

export declare const IssuanceConfig:
  damlTypes.Serializable<IssuanceConfig> & {
  }
;

