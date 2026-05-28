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


exports.Batch = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({id: damlTypes.Text.decoder, size: damlTypes.Int.decoder, settlementFrom: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder), settlementUntil: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder), }); }),
  encode: function (__typed__) {
  return {
    id: damlTypes.Text.encode(__typed__.id),
    size: damlTypes.Int.encode(__typed__.size),
    settlementFrom: damlTypes.Optional(damlTypes.Time).encode(__typed__.settlementFrom),
    settlementUntil: damlTypes.Optional(damlTypes.Time).encode(__typed__.settlementUntil),
  };
}
,
};

