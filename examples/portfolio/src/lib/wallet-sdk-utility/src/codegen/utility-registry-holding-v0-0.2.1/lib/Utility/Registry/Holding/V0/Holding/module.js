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

var pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f = require('@daml.js/splice-api-token-metadata-v1-1.0.0');
var pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b = require('@daml.js/splice-api-token-holding-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff = require('@daml.js/daml-stdlib-DA-Set-Types-1.0.0');

var Utility_Registry_Holding_V0_Types = require('../../../../../Utility/Registry/Holding/V0/Types/module');


exports.Holding_Transfer_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCid: damlTypes.ContractId(exports.Holding).decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingCid: damlTypes.ContractId(exports.Holding).encode(__typed__.holdingCid),
  };
}
,
};



exports.Holding_Merge_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCid: damlTypes.ContractId(exports.Holding).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    holdingCid: damlTypes.ContractId(exports.Holding).encode(__typed__.holdingCid),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.Holding_Split_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({splitCids: damlTypes.List(damlTypes.ContractId(exports.Holding)).decoder, remaining: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.Holding)).decoder), meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    splitCids: damlTypes.List(damlTypes.ContractId(exports.Holding)).encode(__typed__.splitCids),
    remaining: damlTypes.Optional(damlTypes.ContractId(exports.Holding)).encode(__typed__.remaining),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.Holding_Unlock_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCid: damlTypes.ContractId(exports.Holding).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    holdingCid: damlTypes.ContractId(exports.Holding).encode(__typed__.holdingCid),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.Holding_Lock_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCid: damlTypes.ContractId(exports.Holding).decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingCid: damlTypes.ContractId(exports.Holding).encode(__typed__.holdingCid),
  };
}
,
};



exports.Lock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lockers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party).decoder, context: damlTypes.Text.decoder, observers: jtv.Decoder.withDefault(null, damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).decoder), }); }),
  encode: function (__typed__) {
  return {
    lockers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party).encode(__typed__.lockers),
    context: damlTypes.Text.encode(__typed__.context),
    observers: damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).encode(__typed__.observers),
  };
}
,
};



exports.Holding_Merge = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCids: damlTypes.List(damlTypes.ContractId(exports.Holding)).decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingCids: damlTypes.List(damlTypes.ContractId(exports.Holding)).encode(__typed__.holdingCids),
  };
}
,
};



exports.Holding_Split = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amounts: damlTypes.List(damlTypes.Numeric(10)).decoder, }); }),
  encode: function (__typed__) {
  return {
    amounts: damlTypes.List(damlTypes.Numeric(10)).encode(__typed__.amounts),
  };
}
,
};



exports.Holding_Transfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newOwner: damlTypes.Party.decoder, newLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    newOwner: damlTypes.Party.encode(__typed__.newOwner),
    newLabel: damlTypes.Text.encode(__typed__.newLabel),
  };
}
,
};



exports.Holding_Unlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.Holding_Lock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lockers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party).decoder, context: damlTypes.Text.decoder, observers: jtv.Decoder.withDefault(null, damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).decoder), }); }),
  encode: function (__typed__) {
  return {
    lockers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party).encode(__typed__.lockers),
    context: damlTypes.Text.encode(__typed__.context),
    observers: damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).encode(__typed__.observers),
  };
}
,
};



exports.Holding = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-holding-v0:Utility.Registry.Holding.V0.Holding:Holding',
  templateIdWithPackageId: '8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1:Utility.Registry.Holding.V0.Holding:Holding',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, owner: damlTypes.Party.decoder, instrument: Utility_Registry_Holding_V0_Types.InstrumentIdentifier.decoder, label: damlTypes.Text.decoder, amount: damlTypes.Numeric(10).decoder, lock: jtv.Decoder.withDefault(null, damlTypes.Optional(exports.Lock).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    owner: damlTypes.Party.encode(__typed__.owner),
    instrument: Utility_Registry_Holding_V0_Types.InstrumentIdentifier.encode(__typed__.instrument),
    label: damlTypes.Text.encode(__typed__.label),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    lock: damlTypes.Optional(exports.Lock).encode(__typed__.lock),
  };
}
,
  Archive: {
    template: function () { return exports.Holding; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Holding_Unlock: {
    template: function () { return exports.Holding; },
    choiceName: 'Holding_Unlock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Unlock.decoder; }),
    argumentEncode: function (__typed__) { return exports.Holding_Unlock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Unlock_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.Holding_Unlock_Result.encode(__typed__); },
  },
  Holding_Merge: {
    template: function () { return exports.Holding; },
    choiceName: 'Holding_Merge',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Merge.decoder; }),
    argumentEncode: function (__typed__) { return exports.Holding_Merge.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Merge_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.Holding_Merge_Result.encode(__typed__); },
  },
  Holding_Lock: {
    template: function () { return exports.Holding; },
    choiceName: 'Holding_Lock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Lock.decoder; }),
    argumentEncode: function (__typed__) { return exports.Holding_Lock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Lock_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.Holding_Lock_Result.encode(__typed__); },
  },
  Holding_Transfer: {
    template: function () { return exports.Holding; },
    choiceName: 'Holding_Transfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Transfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.Holding_Transfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Transfer_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.Holding_Transfer_Result.encode(__typed__); },
  },
  Holding_Split: {
    template: function () { return exports.Holding; },
    choiceName: 'Holding_Split',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Split.decoder; }),
    argumentEncode: function (__typed__) { return exports.Holding_Split.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Holding_Split_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.Holding_Split_Result.encode(__typed__); },
  },
}

, pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding
);


damlTypes.registerTemplate(exports.Holding, ['8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1', '#utility-registry-holding-v0']);

