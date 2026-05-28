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


exports.WithOperatorRegistrarHolderInstrument = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, instrument: exports.InstrumentIdentifier.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    holder: damlTypes.Party.encode(__typed__.holder),
    instrument: exports.InstrumentIdentifier.encode(__typed__.instrument),
  };
}
,
};



exports.WithOperatorProviderRegistrarHolderInstrument = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, instrument: exports.InstrumentIdentifier.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    holder: damlTypes.Party.encode(__typed__.holder),
    instrument: exports.InstrumentIdentifier.encode(__typed__.instrument),
  };
}
,
};



exports.WithOperatorProviderRegistrarHolder = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    holder: damlTypes.Party.encode(__typed__.holder),
  };
}
,
};



exports.WithOperatorRegistrar = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    registrar: damlTypes.Party.encode(__typed__.registrar),
  };
}
,
};



exports.WithOperatorProviderRegistrar = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
  };
}
,
};



exports.WithOperatorProvider = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
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



exports.InstrumentIdentifier = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({source: damlTypes.Party.decoder, id: damlTypes.Text.decoder, scheme: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    source: damlTypes.Party.encode(__typed__.source),
    id: damlTypes.Text.encode(__typed__.id),
    scheme: damlTypes.Text.encode(__typed__.scheme),
  };
}
,
};

