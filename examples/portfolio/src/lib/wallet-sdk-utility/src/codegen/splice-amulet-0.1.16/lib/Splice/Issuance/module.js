"use strict";
/* eslint-disable-next-line no-unused-vars */
function __export(m) {
/* eslint-disable-next-line no-prototype-builtins */
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable-next-line no-unused-vars */
var jtv = require('@mojotech/json-type-validation');
/* eslint-disable-next-line no-unused-vars */
var damlTypes = require('@daml/types');


exports.IssuanceTranche = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rewardsToIssue: damlTypes.Numeric(10).decoder, issuancePerCoupon: damlTypes.Numeric(10).decoder, unclaimedRewards: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    rewardsToIssue: damlTypes.Numeric(10).encode(__typed__.rewardsToIssue),
    issuancePerCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerCoupon),
    unclaimedRewards: damlTypes.Numeric(10).encode(__typed__.unclaimedRewards),
  };
}
,
};



exports.IssuingRoundParameters = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({issuancePerValidatorRewardCoupon: damlTypes.Numeric(10).decoder, issuancePerFeaturedAppRewardCoupon: damlTypes.Numeric(10).decoder, issuancePerUnfeaturedAppRewardCoupon: damlTypes.Numeric(10).decoder, issuancePerSvRewardCoupon: damlTypes.Numeric(10).decoder, unclaimedAppRewards: damlTypes.Numeric(10).decoder, unclaimedValidatorRewards: damlTypes.Numeric(10).decoder, unclaimedSvRewards: damlTypes.Numeric(10).decoder, issuancePerValidatorFaucetCoupon: damlTypes.Numeric(10).decoder, optAmuletsToIssueToDevelopmentFund: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), }); }),
  encode: function (__typed__) {
  return {
    issuancePerValidatorRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerValidatorRewardCoupon),
    issuancePerFeaturedAppRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerFeaturedAppRewardCoupon),
    issuancePerUnfeaturedAppRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerUnfeaturedAppRewardCoupon),
    issuancePerSvRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerSvRewardCoupon),
    unclaimedAppRewards: damlTypes.Numeric(10).encode(__typed__.unclaimedAppRewards),
    unclaimedValidatorRewards: damlTypes.Numeric(10).encode(__typed__.unclaimedValidatorRewards),
    unclaimedSvRewards: damlTypes.Numeric(10).encode(__typed__.unclaimedSvRewards),
    issuancePerValidatorFaucetCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerValidatorFaucetCoupon),
    optAmuletsToIssueToDevelopmentFund: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.optAmuletsToIssueToDevelopmentFund),
  };
}
,
};



exports.OpenMiningRoundSummary = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({totalValidatorRewardCoupons: damlTypes.Numeric(10).decoder, totalFeaturedAppRewardCoupons: damlTypes.Numeric(10).decoder, totalUnfeaturedAppRewardCoupons: damlTypes.Numeric(10).decoder, totalSvRewardWeight: damlTypes.Int.decoder, optTotalValidatorFaucetCoupons: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Int).decoder), }); }),
  encode: function (__typed__) {
  return {
    totalValidatorRewardCoupons: damlTypes.Numeric(10).encode(__typed__.totalValidatorRewardCoupons),
    totalFeaturedAppRewardCoupons: damlTypes.Numeric(10).encode(__typed__.totalFeaturedAppRewardCoupons),
    totalUnfeaturedAppRewardCoupons: damlTypes.Numeric(10).encode(__typed__.totalUnfeaturedAppRewardCoupons),
    totalSvRewardWeight: damlTypes.Int.encode(__typed__.totalSvRewardWeight),
    optTotalValidatorFaucetCoupons: damlTypes.Optional(damlTypes.Int).encode(__typed__.optTotalValidatorFaucetCoupons),
  };
}
,
};



exports.IssuanceConfig = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletToIssuePerYear: damlTypes.Numeric(10).decoder, validatorRewardPercentage: damlTypes.Numeric(10).decoder, appRewardPercentage: damlTypes.Numeric(10).decoder, validatorRewardCap: damlTypes.Numeric(10).decoder, featuredAppRewardCap: damlTypes.Numeric(10).decoder, unfeaturedAppRewardCap: damlTypes.Numeric(10).decoder, optValidatorFaucetCap: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), optDevelopmentFundPercentage: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), }); }),
  encode: function (__typed__) {
  return {
    amuletToIssuePerYear: damlTypes.Numeric(10).encode(__typed__.amuletToIssuePerYear),
    validatorRewardPercentage: damlTypes.Numeric(10).encode(__typed__.validatorRewardPercentage),
    appRewardPercentage: damlTypes.Numeric(10).encode(__typed__.appRewardPercentage),
    validatorRewardCap: damlTypes.Numeric(10).encode(__typed__.validatorRewardCap),
    featuredAppRewardCap: damlTypes.Numeric(10).encode(__typed__.featuredAppRewardCap),
    unfeaturedAppRewardCap: damlTypes.Numeric(10).encode(__typed__.unfeaturedAppRewardCap),
    optValidatorFaucetCap: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.optValidatorFaucetCap),
    optDevelopmentFundPercentage: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.optDevelopmentFundPercentage),
  };
}
,
};

