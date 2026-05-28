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

var pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 = require('@daml.js/splice-amulet-0.1.16');


exports.BillingCycleParams = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletPrice: damlTypes.Numeric(10).decoder, feeAmountCc: damlTypes.Numeric(10).decoder, newBilledUntil: damlTypes.Time.decoder, depositExpiresAt: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    amuletPrice: damlTypes.Numeric(10).encode(__typed__.amuletPrice),
    feeAmountCc: damlTypes.Numeric(10).encode(__typed__.feeAmountCc),
    newBilledUntil: damlTypes.Time.encode(__typed__.newBilledUntil),
    depositExpiresAt: damlTypes.Time.encode(__typed__.depositExpiresAt),
  };
}
,
};



exports.BillingContext = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({openRoundCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound).decoder, openRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound.decoder, featuredTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, unfeaturedTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    openRoundCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound).encode(__typed__.openRoundCid),
    openRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound.encode(__typed__.openRound),
    featuredTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.featuredTransferContext),
    unfeaturedTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.unfeaturedTransferContext),
  };
}
,
};



exports.UtilityFees = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingFeeUsd: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), baseFee: jtv.Decoder.withDefault(null, damlTypes.Optional(exports.FixedFee).decoder), }); }),
  encode: function (__typed__) {
  return {
    credentialBillingFeeUsd: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.credentialBillingFeeUsd),
    baseFee: damlTypes.Optional(exports.FixedFee).encode(__typed__.baseFee),
  };
}
,
};



exports.FixedFee = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({feePerDayUsd: exports.RatePerDay.decoder, billingPeriodMinutes: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    feePerDayUsd: exports.RatePerDay.encode(__typed__.feePerDayUsd),
    billingPeriodMinutes: damlTypes.Int.encode(__typed__.billingPeriodMinutes),
  };
}
,
};



exports.RatePerDay = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rate: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    rate: damlTypes.Numeric(10).encode(__typed__.rate),
  };
}
,
};



exports.EventBillingState = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({status: exports.BillingStatus.decoder, lastBilledAt: damlTypes.Time.decoder, lastBilledOffset: damlTypes.Int.decoder, migrationId: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder), }); }),
  encode: function (__typed__) {
  return {
    status: exports.BillingStatus.encode(__typed__.status),
    lastBilledAt: damlTypes.Time.encode(__typed__.lastBilledAt),
    lastBilledOffset: damlTypes.Int.encode(__typed__.lastBilledOffset),
    migrationId: damlTypes.Optional(damlTypes.Text).encode(__typed__.migrationId),
  };
}
,
};



exports.BillingState = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({status: exports.BillingStatus.decoder, lastBilledAt: damlTypes.Time.decoder, billedUntil: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    status: exports.BillingStatus.encode(__typed__.status),
    lastBilledAt: damlTypes.Time.encode(__typed__.lastBilledAt),
    billedUntil: damlTypes.Time.encode(__typed__.billedUntil),
  };
}
,
};



exports.BillingStatus = {
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.object({tag: jtv.constant('Success'), value: damlTypes.Unit.decoder, }), jtv.object({tag: jtv.constant('Failure'), value: exports.BillingStatus.Failure.decoder, }), jtv.object({tag: jtv.constant('New'), value: damlTypes.Unit.decoder, })); }),
  encode: function (__typed__) {
  switch(__typed__.tag) {
    case 'Success': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
    case 'Failure': return {tag: __typed__.tag, value: exports.BillingStatus.Failure.encode(__typed__.value)};
    case 'New': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
    default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type BillingStatus';
  }
}
,
  Failure:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, context: damlTypes.Text.decoder, }); }),
    encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
    context: damlTypes.Text.encode(__typed__.context),
  };
}
,
  }),
};



