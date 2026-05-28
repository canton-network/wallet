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

var pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b = require('@daml.js/splice-api-token-holding-v1-1.0.0');


exports.WithOperatorCounterparty = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, counterparty: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    counterparty: damlTypes.Party.encode(__typed__.counterparty),
  };
}
,
};



exports.WithOperatorRequestor = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, requestor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    requestor: damlTypes.Party.encode(__typed__.requestor),
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



exports.CollateralPosition = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({pledgor: damlTypes.Party.decoder, securedParty: damlTypes.Party.decoder, instrument: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.decoder, amount: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    pledgor: damlTypes.Party.encode(__typed__.pledgor),
    securedParty: damlTypes.Party.encode(__typed__.securedParty),
    instrument: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.encode(__typed__.instrument),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
  };
}
,
};



exports.Terms = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({eligibleCollateral: exports.EligibilitySchedule.decoder, }); }),
  encode: function (__typed__) {
  return {
    eligibleCollateral: exports.EligibilitySchedule.encode(__typed__.eligibleCollateral),
  };
}
,
};



exports.InstrumentQuantity = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrument: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.decoder, amount: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    instrument: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.encode(__typed__.instrument),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
  };
}
,
};



exports.EligibilitySchedule = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({eligibleInstruments: damlTypes.List(exports.EligibleInstrument).decoder, }); }),
  encode: function (__typed__) {
  return {
    eligibleInstruments: damlTypes.List(exports.EligibleInstrument).encode(__typed__.eligibleInstruments),
  };
}
,
};



exports.EligibleInstrument = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrument: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.decoder, }); }),
  encode: function (__typed__) {
  return {
    instrument: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.encode(__typed__.instrument),
  };
}
,
};

