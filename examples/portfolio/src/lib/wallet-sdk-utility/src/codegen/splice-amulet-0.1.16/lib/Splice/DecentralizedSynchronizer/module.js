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
var pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff = require('@daml.js/daml-stdlib-DA-Set-Types-1.0.0');


exports.ForMemberTraffic = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, memberId: damlTypes.Text.decoder, synchronizerId: damlTypes.Text.decoder, migrationId: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    memberId: damlTypes.Text.encode(__typed__.memberId),
    synchronizerId: damlTypes.Text.encode(__typed__.synchronizerId),
    migrationId: damlTypes.Int.encode(__typed__.migrationId),
  };
}
,
};



exports.MemberTraffic = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.DecentralizedSynchronizer:MemberTraffic',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.DecentralizedSynchronizer:MemberTraffic',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, memberId: damlTypes.Text.decoder, synchronizerId: damlTypes.Text.decoder, migrationId: damlTypes.Int.decoder, totalPurchased: damlTypes.Int.decoder, numPurchases: damlTypes.Int.decoder, amuletSpent: damlTypes.Numeric(10).decoder, usdSpent: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    memberId: damlTypes.Text.encode(__typed__.memberId),
    synchronizerId: damlTypes.Text.encode(__typed__.synchronizerId),
    migrationId: damlTypes.Int.encode(__typed__.migrationId),
    totalPurchased: damlTypes.Int.encode(__typed__.totalPurchased),
    numPurchases: damlTypes.Int.encode(__typed__.numPurchases),
    amuletSpent: damlTypes.Numeric(10).encode(__typed__.amuletSpent),
    usdSpent: damlTypes.Numeric(10).encode(__typed__.usdSpent),
  };
}
,
  Archive: {
    template: function () { return exports.MemberTraffic; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.MemberTraffic, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.SynchronizerFeesConfig = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({baseRateTrafficLimits: exports.BaseRateTrafficLimits.decoder, extraTrafficPrice: damlTypes.Numeric(10).decoder, readVsWriteScalingFactor: damlTypes.Int.decoder, minTopupAmount: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    baseRateTrafficLimits: exports.BaseRateTrafficLimits.encode(__typed__.baseRateTrafficLimits),
    extraTrafficPrice: damlTypes.Numeric(10).encode(__typed__.extraTrafficPrice),
    readVsWriteScalingFactor: damlTypes.Int.encode(__typed__.readVsWriteScalingFactor),
    minTopupAmount: damlTypes.Int.encode(__typed__.minTopupAmount),
  };
}
,
};



exports.BaseRateTrafficLimits = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burstAmount: damlTypes.Int.decoder, burstWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder, }); }),
  encode: function (__typed__) {
  return {
    burstAmount: damlTypes.Int.encode(__typed__.burstAmount),
    burstWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.burstWindow),
  };
}
,
};



exports.AmuletDecentralizedSynchronizerConfig = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({requiredSynchronizers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Text).decoder, activeSynchronizer: damlTypes.Text.decoder, fees: exports.SynchronizerFeesConfig.decoder, }); }),
  encode: function (__typed__) {
  return {
    requiredSynchronizers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Text).encode(__typed__.requiredSynchronizers),
    activeSynchronizer: damlTypes.Text.encode(__typed__.activeSynchronizer),
    fees: exports.SynchronizerFeesConfig.encode(__typed__.fees),
  };
}
,
};

