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


exports.TxKind = {
  TxKind_Transfer: 'TxKind_Transfer',
  TxKind_Unlock: 'TxKind_Unlock',
  TxKind_MergeSplit: 'TxKind_MergeSplit',
  TxKind_Burn: 'TxKind_Burn',
  TxKind_Mint: 'TxKind_Mint',
  TxKind_ExpireDust: 'TxKind_ExpireDust',
  keys: ['TxKind_Transfer','TxKind_Unlock','TxKind_MergeSplit','TxKind_Burn','TxKind_Mint','TxKind_ExpireDust',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.TxKind.TxKind_Transfer), jtv.constant(exports.TxKind.TxKind_Unlock), jtv.constant(exports.TxKind.TxKind_MergeSplit), jtv.constant(exports.TxKind.TxKind_Burn), jtv.constant(exports.TxKind.TxKind_Mint), jtv.constant(exports.TxKind.TxKind_ExpireDust)); }),
  encode: function (__typed__) { return __typed__; },
};

