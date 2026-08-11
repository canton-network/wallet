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

exports.CallSource = {
  CalledFromV1: 'CalledFromV1',
  CalledFromV2: 'CalledFromV2',
  keys: ['CalledFromV1', 'CalledFromV2'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.CallSource.CalledFromV1),
      jtv.constant(exports.CallSource.CalledFromV2),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};
