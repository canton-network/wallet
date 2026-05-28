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

var pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946 = require('@daml.js/daml-stdlib-DA-Time-Types-1.0.0');

var Splice_DecentralizedSynchronizer = require('../../Splice/DecentralizedSynchronizer/module');
var Splice_Fees = require('../../Splice/Fees/module');
var Splice_Issuance = require('../../Splice/Issuance/module');
var Splice_Schedule = require('../../Splice/Schedule/module');


exports.PackageConfig = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amulet: damlTypes.Text.decoder, amuletNameService: damlTypes.Text.decoder, dsoGovernance: damlTypes.Text.decoder, validatorLifecycle: damlTypes.Text.decoder, wallet: damlTypes.Text.decoder, walletPayments: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    amulet: damlTypes.Text.encode(__typed__.amulet),
    amuletNameService: damlTypes.Text.encode(__typed__.amuletNameService),
    dsoGovernance: damlTypes.Text.encode(__typed__.dsoGovernance),
    validatorLifecycle: damlTypes.Text.encode(__typed__.validatorLifecycle),
    wallet: damlTypes.Text.encode(__typed__.wallet),
    walletPayments: damlTypes.Text.encode(__typed__.walletPayments),
  };
}
,
};



exports.AmuletConfig = function (unit) { return ({
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferConfig: exports.TransferConfig(unit).decoder, issuanceCurve: Splice_Schedule.Schedule(pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime, Splice_Issuance.IssuanceConfig).decoder, decentralizedSynchronizer: Splice_DecentralizedSynchronizer.AmuletDecentralizedSynchronizerConfig.decoder, tickDuration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder, packageConfig: exports.PackageConfig.decoder, transferPreapprovalFee: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), featuredAppActivityMarkerAmount: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), optDevelopmentFundManager: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    transferConfig: exports.TransferConfig(unit).encode(__typed__.transferConfig),
    issuanceCurve: Splice_Schedule.Schedule(pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime, Splice_Issuance.IssuanceConfig).encode(__typed__.issuanceCurve),
    decentralizedSynchronizer: Splice_DecentralizedSynchronizer.AmuletDecentralizedSynchronizerConfig.encode(__typed__.decentralizedSynchronizer),
    tickDuration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.tickDuration),
    packageConfig: exports.PackageConfig.encode(__typed__.packageConfig),
    transferPreapprovalFee: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.transferPreapprovalFee),
    featuredAppActivityMarkerAmount: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.featuredAppActivityMarkerAmount),
    optDevelopmentFundManager: damlTypes.Optional(damlTypes.Party).encode(__typed__.optDevelopmentFundManager),
  };
}
,
}); };



exports.TransferConfig = function (unit) { return ({
  decoder: damlTypes.lazyMemo(function () { return jtv.object({createFee: Splice_Fees.FixedFee.decoder, holdingFee: Splice_Fees.RatePerRound.decoder, transferFee: Splice_Fees.SteppedRate.decoder, lockHolderFee: Splice_Fees.FixedFee.decoder, extraFeaturedAppRewardAmount: damlTypes.Numeric(10).decoder, maxNumInputs: damlTypes.Int.decoder, maxNumOutputs: damlTypes.Int.decoder, maxNumLockHolders: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    createFee: Splice_Fees.FixedFee.encode(__typed__.createFee),
    holdingFee: Splice_Fees.RatePerRound.encode(__typed__.holdingFee),
    transferFee: Splice_Fees.SteppedRate.encode(__typed__.transferFee),
    lockHolderFee: Splice_Fees.FixedFee.encode(__typed__.lockHolderFee),
    extraFeaturedAppRewardAmount: damlTypes.Numeric(10).encode(__typed__.extraFeaturedAppRewardAmount),
    maxNumInputs: damlTypes.Int.encode(__typed__.maxNumInputs),
    maxNumOutputs: damlTypes.Int.encode(__typed__.maxNumOutputs),
    maxNumLockHolders: damlTypes.Int.encode(__typed__.maxNumLockHolders),
  };
}
,
}); };



exports.USD = {
  USD: 'USD',
  keys: ['USD',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.USD.USD)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.Amulet = {
  Amulet: 'Amulet',
  keys: ['Amulet',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.Amulet.Amulet)); }),
  encode: function (__typed__) { return __typed__; },
};

