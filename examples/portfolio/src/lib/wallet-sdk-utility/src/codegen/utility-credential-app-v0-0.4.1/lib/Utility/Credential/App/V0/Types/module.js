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


exports.WithOperatorIssuerHolder = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, issuer: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    issuer: damlTypes.Party.encode(__typed__.issuer),
    holder: damlTypes.Party.encode(__typed__.holder),
  };
}
,
};



exports.WithOperatorHolder = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    holder: damlTypes.Party.encode(__typed__.holder),
  };
}
,
};



exports.WithOperator = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
  };
}
,
};



exports.WithDsoOperatorHolder = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, operator: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    operator: damlTypes.Party.encode(__typed__.operator),
    holder: damlTypes.Party.encode(__typed__.holder),
  };
}
,
};



exports.WithDsoOperatorIssuer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, operator: damlTypes.Party.decoder, issuer: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    operator: damlTypes.Party.encode(__typed__.operator),
    issuer: damlTypes.Party.encode(__typed__.issuer),
  };
}
,
};



exports.WithDsoOperator = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, operator: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    operator: damlTypes.Party.encode(__typed__.operator),
  };
}
,
};



exports.BillingContext = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({now: damlTypes.Time.decoder, amuletRulesCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AmuletRules).decoder, openRoundCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound).decoder, openRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound.decoder, featuredTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, unfeaturedTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, feeComputationContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    now: damlTypes.Time.encode(__typed__.now),
    amuletRulesCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AmuletRules).encode(__typed__.amuletRulesCid),
    openRoundCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound).encode(__typed__.openRoundCid),
    openRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound.encode(__typed__.openRound),
    featuredTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.featuredTransferContext),
    unfeaturedTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.unfeaturedTransferContext),
    feeComputationContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferContext.encode(__typed__.feeComputationContext),
  };
}
,
};



exports.BillingCycleParams = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletPrice: damlTypes.Numeric(10).decoder, credentialFeeCc: damlTypes.Numeric(10).decoder, newBilledUntil: damlTypes.Time.decoder, depositExpiresAt: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    amuletPrice: damlTypes.Numeric(10).encode(__typed__.amuletPrice),
    credentialFeeCc: damlTypes.Numeric(10).encode(__typed__.credentialFeeCc),
    newBilledUntil: damlTypes.Time.encode(__typed__.newBilledUntil),
    depositExpiresAt: damlTypes.Time.encode(__typed__.depositExpiresAt),
  };
}
,
};



exports.BillingState = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({createdAt: damlTypes.Time.decoder, status: exports.BillingStatus.decoder, lastBilledAt: damlTypes.Time.decoder, billedUntil: damlTypes.Time.decoder, lastBilledInRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Types.Round.decoder, totalCcFeesPaidIssuerCc: damlTypes.Numeric(10).decoder, totalCcFeesPaidHolderCc: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    createdAt: damlTypes.Time.encode(__typed__.createdAt),
    status: exports.BillingStatus.encode(__typed__.status),
    lastBilledAt: damlTypes.Time.encode(__typed__.lastBilledAt),
    billedUntil: damlTypes.Time.encode(__typed__.billedUntil),
    lastBilledInRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Types.Round.encode(__typed__.lastBilledInRound),
    totalCcFeesPaidIssuerCc: damlTypes.Numeric(10).encode(__typed__.totalCcFeesPaidIssuerCc),
    totalCcFeesPaidHolderCc: damlTypes.Numeric(10).encode(__typed__.totalCcFeesPaidHolderCc),
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





exports.BalanceState = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({currentDepositAmountCc: damlTypes.Numeric(10).decoder, totalCredentialFeesPaidCc: damlTypes.Numeric(10).decoder, totalDistributedCc: damlTypes.Numeric(10).decoder, totalPaidOutCc: damlTypes.Numeric(10).decoder, totalUserDepositCc: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    currentDepositAmountCc: damlTypes.Numeric(10).encode(__typed__.currentDepositAmountCc),
    totalCredentialFeesPaidCc: damlTypes.Numeric(10).encode(__typed__.totalCredentialFeesPaidCc),
    totalDistributedCc: damlTypes.Numeric(10).encode(__typed__.totalDistributedCc),
    totalPaidOutCc: damlTypes.Numeric(10).encode(__typed__.totalPaidOutCc),
    totalUserDepositCc: damlTypes.Numeric(10).encode(__typed__.totalUserDepositCc),
  };
}
,
};



exports.BillingParams = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({feePerDayUsd: exports.RatePerDay.decoder, billingPeriodMinutes: damlTypes.Int.decoder, depositTargetAmountUsd: damlTypes.Numeric(10).decoder, holderActivityWeight: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), }); }),
  encode: function (__typed__) {
  return {
    feePerDayUsd: exports.RatePerDay.encode(__typed__.feePerDayUsd),
    billingPeriodMinutes: damlTypes.Int.encode(__typed__.billingPeriodMinutes),
    depositTargetAmountUsd: damlTypes.Numeric(10).encode(__typed__.depositTargetAmountUsd),
    holderActivityWeight: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.holderActivityWeight),
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

