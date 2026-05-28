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

exports.BurnMintFactory = damlTypes.assembleInterface(
  '#splice-api-token-burn-mint-v1:Splice.Api.Token.BurnMintV1:BurnMintFactory',
  '9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e:Splice.Api.Token.BurnMintV1:BurnMintFactory',
  function () { return exports.BurnMintFactoryView; },
  {
    Archive: {
      template: function () { return exports.BurnMintFactory; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    BurnMintFactory_PublicFetch: {
      template: function () { return exports.BurnMintFactory; },
      choiceName: 'BurnMintFactory_PublicFetch',
      argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnMintFactory_PublicFetch.decoder; }),
      argumentEncode: function (__typed__) { return exports.BurnMintFactory_PublicFetch.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () { return exports.BurnMintFactoryView.decoder; }),
      resultEncode: function (__typed__) { return exports.BurnMintFactoryView.encode(__typed__); },
    },
    BurnMintFactory_BurnMint: {
      template: function () { return exports.BurnMintFactory; },
      choiceName: 'BurnMintFactory_BurnMint',
      argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnMintFactory_BurnMint.decoder; }),
      argumentEncode: function (__typed__) { return exports.BurnMintFactory_BurnMint.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () { return exports.BurnMintFactory_BurnMintResult.decoder; }),
      resultEncode: function (__typed__) { return exports.BurnMintFactory_BurnMintResult.encode(__typed__); },
    },
  });



exports.BurnMintFactoryView = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({admin: damlTypes.Party.decoder, meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    admin: damlTypes.Party.encode(__typed__.admin),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
  };
}
,
};



exports.BurnMintFactory_BurnMintResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({outputCids: damlTypes.List(damlTypes.ContractId(pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding)).decoder, }); }),
  encode: function (__typed__) {
  return {
    outputCids: damlTypes.List(damlTypes.ContractId(pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding)).encode(__typed__.outputCids),
  };
}
,
};



exports.BurnMintOutput = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({owner: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, context: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ChoiceContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    owner: damlTypes.Party.encode(__typed__.owner),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    context: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ChoiceContext.encode(__typed__.context),
  };
}
,
};



exports.BurnMintFactory_PublicFetch = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({expectedAdmin: damlTypes.Party.decoder, actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    expectedAdmin: damlTypes.Party.encode(__typed__.expectedAdmin),
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.BurnMintFactory_BurnMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({expectedAdmin: damlTypes.Party.decoder, instrumentId: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.decoder, inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding)).decoder, outputs: damlTypes.List(exports.BurnMintOutput).decoder, extraActors: damlTypes.List(damlTypes.Party).decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    expectedAdmin: damlTypes.Party.encode(__typed__.expectedAdmin),
    instrumentId: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.encode(__typed__.instrumentId),
    inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding)).encode(__typed__.inputHoldingCids),
    outputs: damlTypes.List(exports.BurnMintOutput).encode(__typed__.outputs),
    extraActors: damlTypes.List(damlTypes.Party).encode(__typed__.extraActors),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};

