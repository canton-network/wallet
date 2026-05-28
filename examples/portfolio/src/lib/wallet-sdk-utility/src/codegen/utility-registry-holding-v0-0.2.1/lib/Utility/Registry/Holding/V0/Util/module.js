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
var pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff = require('@daml.js/daml-stdlib-DA-Set-Types-1.0.0');

var Utility_Registry_Holding_V0_Holding = require('../../../../../Utility/Registry/Holding/V0/Holding/module');


exports.ExpectedLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lockers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party).decoder, context: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    lockers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party).encode(__typed__.lockers),
    context: damlTypes.Text.encode(__typed__.context),
  };
}
,
};



exports.CollapseAction_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({output: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(Utility_Registry_Holding_V0_Holding.Holding), Utility_Registry_Holding_V0_Holding.Holding)).decoder), remaining: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Utility_Registry_Holding_V0_Holding.Holding)).decoder), }); }),
  encode: function (__typed__) {
  return {
    output: damlTypes.Optional(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(Utility_Registry_Holding_V0_Holding.Holding), Utility_Registry_Holding_V0_Holding.Holding)).encode(__typed__.output),
    remaining: damlTypes.Optional(damlTypes.ContractId(Utility_Registry_Holding_V0_Holding.Holding)).encode(__typed__.remaining),
  };
}
,
};



exports.CollapseAction = {
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.object({tag: jtv.constant('MergeSplit'), value: damlTypes.Unit.decoder, }), jtv.object({tag: jtv.constant('MergeSplitLock'), value: Utility_Registry_Holding_V0_Holding.Lock.decoder, }), jtv.object({tag: jtv.constant('MergeSplitBurn'), value: damlTypes.Unit.decoder, }), jtv.object({tag: jtv.constant('UnlockMergeSplitBurn'), value: exports.ExpectedLock.decoder, }), jtv.object({tag: jtv.constant('MergeSplitTransfer'), value: damlTypes.Party.decoder, }), jtv.object({tag: jtv.constant('UnlockMergeSplitTransfer'), value: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(exports.ExpectedLock, damlTypes.Party).decoder, }), jtv.object({tag: jtv.constant('AutoUnlockMergeSplitTransfer'), value: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(exports.ExpectedLock, damlTypes.Party).decoder, }), jtv.object({tag: jtv.constant('UnlockMergeSplitLockRemaining'), value: damlTypes.Unit.decoder, })); }),
  encode: function (__typed__) {
  switch(__typed__.tag) {
    case 'MergeSplit': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
    case 'MergeSplitLock': return {tag: __typed__.tag, value: Utility_Registry_Holding_V0_Holding.Lock.encode(__typed__.value)};
    case 'MergeSplitBurn': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
    case 'UnlockMergeSplitBurn': return {tag: __typed__.tag, value: exports.ExpectedLock.encode(__typed__.value)};
    case 'MergeSplitTransfer': return {tag: __typed__.tag, value: damlTypes.Party.encode(__typed__.value)};
    case 'UnlockMergeSplitTransfer': return {tag: __typed__.tag, value: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(exports.ExpectedLock, damlTypes.Party).encode(__typed__.value)};
    case 'AutoUnlockMergeSplitTransfer': return {tag: __typed__.tag, value: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(exports.ExpectedLock, damlTypes.Party).encode(__typed__.value)};
    case 'UnlockMergeSplitLockRemaining': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
    default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type CollapseAction';
  }
}
,
};

