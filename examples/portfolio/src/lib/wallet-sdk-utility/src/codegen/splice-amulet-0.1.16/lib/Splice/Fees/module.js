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

var pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 = require('@daml.js/daml-prim-DA-Types-1.0.0');

var Splice_Types = require('../../Splice/Types/module');


exports.RatePerDay = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rate: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    rate: damlTypes.Numeric(10).encode(__typed__.rate),
  };
}
,
};



exports.ExpiringAmount = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({initialAmount: damlTypes.Numeric(10).decoder, createdAt: Splice_Types.Round.decoder, ratePerRound: exports.RatePerRound.decoder, }); }),
  encode: function (__typed__) {
  return {
    initialAmount: damlTypes.Numeric(10).encode(__typed__.initialAmount),
    createdAt: Splice_Types.Round.encode(__typed__.createdAt),
    ratePerRound: exports.RatePerRound.encode(__typed__.ratePerRound),
  };
}
,
};



exports.SteppedRate = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({initialRate: damlTypes.Numeric(10).decoder, steps: damlTypes.List(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Numeric(10), damlTypes.Numeric(10))).decoder, }); }),
  encode: function (__typed__) {
  return {
    initialRate: damlTypes.Numeric(10).encode(__typed__.initialRate),
    steps: damlTypes.List(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Numeric(10), damlTypes.Numeric(10))).encode(__typed__.steps),
  };
}
,
};



exports.FixedFee = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({fee: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    fee: damlTypes.Numeric(10).encode(__typed__.fee),
  };
}
,
};



exports.RatePerRound = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rate: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    rate: damlTypes.Numeric(10).encode(__typed__.rate),
  };
}
,
};

