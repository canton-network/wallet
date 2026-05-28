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


exports.TimeLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holders: damlTypes.List(damlTypes.Party).decoder, expiresAt: damlTypes.Time.decoder, optContext: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder), }); }),
  encode: function (__typed__) {
  return {
    holders: damlTypes.List(damlTypes.Party).encode(__typed__.holders),
    expiresAt: damlTypes.Time.encode(__typed__.expiresAt),
    optContext: damlTypes.Optional(damlTypes.Text).encode(__typed__.optContext),
  };
}
,
};



exports.BoundedSet = function (a) { return ({
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.object({tag: jtv.constant('Singleton'), value: a.decoder, }), jtv.object({tag: jtv.constant('AfterMaxBound'), value: damlTypes.Unit.decoder, })); }),
  encode: function (__typed__) {
  switch(__typed__.tag) {
    case 'Singleton': return {tag: __typed__.tag, value: a.encode(__typed__.value)};
    case 'AfterMaxBound': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
    default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type BoundedSet';
  }
}
,
}); };

