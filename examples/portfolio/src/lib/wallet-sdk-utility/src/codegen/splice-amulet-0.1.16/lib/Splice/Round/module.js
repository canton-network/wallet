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

var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946 = require('@daml.js/daml-stdlib-DA-Time-Types-1.0.0');

var Splice_AmuletConfig = require('../../Splice/AmuletConfig/module');
var Splice_Issuance = require('../../Splice/Issuance/module');
var Splice_Types = require('../../Splice/Types/module');


exports.ClosedMiningRound = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Round:ClosedMiningRound',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Round:ClosedMiningRound',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, round: Splice_Types.Round.decoder, issuancePerValidatorRewardCoupon: damlTypes.Numeric(10).decoder, issuancePerFeaturedAppRewardCoupon: damlTypes.Numeric(10).decoder, issuancePerUnfeaturedAppRewardCoupon: damlTypes.Numeric(10).decoder, issuancePerSvRewardCoupon: damlTypes.Numeric(10).decoder, optIssuancePerValidatorFaucetCoupon: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    round: Splice_Types.Round.encode(__typed__.round),
    issuancePerValidatorRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerValidatorRewardCoupon),
    issuancePerFeaturedAppRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerFeaturedAppRewardCoupon),
    issuancePerUnfeaturedAppRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerUnfeaturedAppRewardCoupon),
    issuancePerSvRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerSvRewardCoupon),
    optIssuancePerValidatorFaucetCoupon: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.optIssuancePerValidatorFaucetCoupon),
  };
}
,
  Archive: {
    template: function () { return exports.ClosedMiningRound; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ClosedMiningRound, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.IssuingMiningRound = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Round:IssuingMiningRound',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Round:IssuingMiningRound',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, round: Splice_Types.Round.decoder, issuancePerValidatorRewardCoupon: damlTypes.Numeric(10).decoder, issuancePerFeaturedAppRewardCoupon: damlTypes.Numeric(10).decoder, issuancePerUnfeaturedAppRewardCoupon: damlTypes.Numeric(10).decoder, issuancePerSvRewardCoupon: damlTypes.Numeric(10).decoder, opensAt: damlTypes.Time.decoder, targetClosesAt: damlTypes.Time.decoder, optIssuancePerValidatorFaucetCoupon: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    round: Splice_Types.Round.encode(__typed__.round),
    issuancePerValidatorRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerValidatorRewardCoupon),
    issuancePerFeaturedAppRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerFeaturedAppRewardCoupon),
    issuancePerUnfeaturedAppRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerUnfeaturedAppRewardCoupon),
    issuancePerSvRewardCoupon: damlTypes.Numeric(10).encode(__typed__.issuancePerSvRewardCoupon),
    opensAt: damlTypes.Time.encode(__typed__.opensAt),
    targetClosesAt: damlTypes.Time.encode(__typed__.targetClosesAt),
    optIssuancePerValidatorFaucetCoupon: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.optIssuancePerValidatorFaucetCoupon),
  };
}
,
  Archive: {
    template: function () { return exports.IssuingMiningRound; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.IssuingMiningRound, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.SummarizingMiningRound = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Round:SummarizingMiningRound',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Round:SummarizingMiningRound',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, round: Splice_Types.Round.decoder, amuletPrice: damlTypes.Numeric(10).decoder, issuanceConfig: Splice_Issuance.IssuanceConfig.decoder, tickDuration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    round: Splice_Types.Round.encode(__typed__.round),
    amuletPrice: damlTypes.Numeric(10).encode(__typed__.amuletPrice),
    issuanceConfig: Splice_Issuance.IssuanceConfig.encode(__typed__.issuanceConfig),
    tickDuration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.tickDuration),
  };
}
,
  Archive: {
    template: function () { return exports.SummarizingMiningRound; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.SummarizingMiningRound, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.OpenMiningRound_Fetch = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({p: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    p: damlTypes.Party.encode(__typed__.p),
  };
}
,
};



exports.OpenMiningRound = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Round:OpenMiningRound',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Round:OpenMiningRound',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, round: Splice_Types.Round.decoder, amuletPrice: damlTypes.Numeric(10).decoder, opensAt: damlTypes.Time.decoder, targetClosesAt: damlTypes.Time.decoder, issuingFor: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder, transferConfigUsd: Splice_AmuletConfig.TransferConfig(Splice_AmuletConfig.USD).decoder, issuanceConfig: Splice_Issuance.IssuanceConfig.decoder, tickDuration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    round: Splice_Types.Round.encode(__typed__.round),
    amuletPrice: damlTypes.Numeric(10).encode(__typed__.amuletPrice),
    opensAt: damlTypes.Time.encode(__typed__.opensAt),
    targetClosesAt: damlTypes.Time.encode(__typed__.targetClosesAt),
    issuingFor: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.issuingFor),
    transferConfigUsd: Splice_AmuletConfig.TransferConfig(Splice_AmuletConfig.USD).encode(__typed__.transferConfigUsd),
    issuanceConfig: Splice_Issuance.IssuanceConfig.encode(__typed__.issuanceConfig),
    tickDuration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.tickDuration),
  };
}
,
  Archive: {
    template: function () { return exports.OpenMiningRound; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  OpenMiningRound_Fetch: {
    template: function () { return exports.OpenMiningRound; },
    choiceName: 'OpenMiningRound_Fetch',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.OpenMiningRound_Fetch.decoder; }),
    argumentEncode: function (__typed__) { return exports.OpenMiningRound_Fetch.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.OpenMiningRound.decoder; }),
    resultEncode: function (__typed__) { return exports.OpenMiningRound.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.OpenMiningRound, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);

