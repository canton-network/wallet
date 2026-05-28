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


exports.RoundingMode = {
  RoundingUp: 'RoundingUp',
  RoundingDown: 'RoundingDown',
  RoundingCeiling: 'RoundingCeiling',
  RoundingFloor: 'RoundingFloor',
  RoundingHalfUp: 'RoundingHalfUp',
  RoundingHalfDown: 'RoundingHalfDown',
  RoundingHalfEven: 'RoundingHalfEven',
  RoundingUnnecessary: 'RoundingUnnecessary',
  keys: ['RoundingUp','RoundingDown','RoundingCeiling','RoundingFloor','RoundingHalfUp','RoundingHalfDown','RoundingHalfEven','RoundingUnnecessary',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.RoundingMode.RoundingUp), jtv.constant(exports.RoundingMode.RoundingDown), jtv.constant(exports.RoundingMode.RoundingCeiling), jtv.constant(exports.RoundingMode.RoundingFloor), jtv.constant(exports.RoundingMode.RoundingHalfUp), jtv.constant(exports.RoundingMode.RoundingHalfDown), jtv.constant(exports.RoundingMode.RoundingHalfEven), jtv.constant(exports.RoundingMode.RoundingUnnecessary)); }),
  encode: function (__typed__) { return __typed__; },
};

