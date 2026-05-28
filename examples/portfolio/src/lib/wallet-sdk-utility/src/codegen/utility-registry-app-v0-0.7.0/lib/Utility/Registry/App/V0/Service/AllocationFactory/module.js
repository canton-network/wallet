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

var pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520 = require('@daml.js/splice-api-token-allocation-instruction-v1-1.0.0');
var pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f = require('@daml.js/splice-api-token-metadata-v1-1.0.0');
var pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 = require('@daml.js/splice-api-token-transfer-instruction-v1-1.0.0');
var pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 = require('@daml.js/utility-registry-holding-v0-0.2.1');
var pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e = require('@daml.js/splice-api-token-burn-mint-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

var Utility_Registry_App_V0_Model_Burn = require('../../../../../../Utility/Registry/App/V0/Model/Burn/module');
var Utility_Registry_App_V0_Model_Mint = require('../../../../../../Utility/Registry/App/V0/Model/Mint/module');


exports.AllocationFactory_OfferMint_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mintOfferCid: damlTypes.ContractId(Utility_Registry_App_V0_Model_Mint.MintOffer).decoder, meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    mintOfferCid: damlTypes.ContractId(Utility_Registry_App_V0_Model_Mint.MintOffer).encode(__typed__.mintOfferCid),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
  };
}
,
};



exports.AllocationFactory_RequestMint_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mintRequestCid: damlTypes.ContractId(Utility_Registry_App_V0_Model_Mint.MintRequest).decoder, meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    mintRequestCid: damlTypes.ContractId(Utility_Registry_App_V0_Model_Mint.MintRequest).encode(__typed__.mintRequestCid),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
  };
}
,
};



exports.AllocationFactory_OfferBurn_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burnOfferCid: damlTypes.ContractId(Utility_Registry_App_V0_Model_Burn.BurnOffer).decoder, meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    burnOfferCid: damlTypes.ContractId(Utility_Registry_App_V0_Model_Burn.BurnOffer).encode(__typed__.burnOfferCid),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
  };
}
,
};



exports.AllocationFactory_RequestBurn_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burnRequestCid: damlTypes.ContractId(Utility_Registry_App_V0_Model_Burn.BurnRequest).decoder, remaining: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder), meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    burnRequestCid: damlTypes.ContractId(Utility_Registry_App_V0_Model_Burn.BurnRequest).encode(__typed__.burnRequestCid),
    remaining: damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.remaining),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
  };
}
,
};



exports.AllocationFactory_OfferMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({expectedAdmin: damlTypes.Party.decoder, mint: Utility_Registry_App_V0_Model_Mint.Mint.decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    expectedAdmin: damlTypes.Party.encode(__typed__.expectedAdmin),
    mint: Utility_Registry_App_V0_Model_Mint.Mint.encode(__typed__.mint),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};



exports.AllocationFactory_RequestMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({expectedAdmin: damlTypes.Party.decoder, mint: Utility_Registry_App_V0_Model_Mint.Mint.decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    expectedAdmin: damlTypes.Party.encode(__typed__.expectedAdmin),
    mint: Utility_Registry_App_V0_Model_Mint.Mint.encode(__typed__.mint),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};



exports.AllocationFactory_OfferBurn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({expectedAdmin: damlTypes.Party.decoder, burn: Utility_Registry_App_V0_Model_Burn.Burn.decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    expectedAdmin: damlTypes.Party.encode(__typed__.expectedAdmin),
    burn: Utility_Registry_App_V0_Model_Burn.Burn.encode(__typed__.burn),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};



exports.AllocationFactory_RequestBurn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({expectedAdmin: damlTypes.Party.decoder, burn: Utility_Registry_App_V0_Model_Burn.Burn.decoder, holdingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    expectedAdmin: damlTypes.Party.encode(__typed__.expectedAdmin),
    burn: Utility_Registry_App_V0_Model_Burn.Burn.encode(__typed__.burn),
    holdingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.holdingCids),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};



exports.AllocationFactory_TransferInternal = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({payload: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory_Transfer.decoder, }); }),
  encode: function (__typed__) {
  return {
    payload: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory_Transfer.encode(__typed__.payload),
  };
}
,
};



exports.AllocationFactory_InternalBurnMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({payload: pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e.Splice.Api.Token.BurnMintV1.BurnMintFactory_BurnMint.decoder, }); }),
  encode: function (__typed__) {
  return {
    payload: pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e.Splice.Api.Token.BurnMintV1.BurnMintFactory_BurnMint.encode(__typed__.payload),
  };
}
,
};



exports.AllocationFactory_AllocateInternal = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({payload: pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory_Allocate.decoder, }); }),
  encode: function (__typed__) {
  return {
    payload: pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory_Allocate.encode(__typed__.payload),
  };
}
,
};



exports.AllocationFactory = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.AllocationFactory:AllocationFactory',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.AllocationFactory:AllocationFactory',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, operator: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    operator: damlTypes.Party.encode(__typed__.operator),
  };
}
,
  AllocationFactory_AllocateInternal: {
    template: function () { return exports.AllocationFactory; },
    choiceName: 'AllocationFactory_AllocateInternal',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_AllocateInternal.decoder; }),
    argumentEncode: function (__typed__) { return exports.AllocationFactory_AllocateInternal.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationInstructionResult.decoder; }),
    resultEncode: function (__typed__) { return pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationInstructionResult.encode(__typed__); },
  },
  AllocationFactory_InternalBurnMint: {
    template: function () { return exports.AllocationFactory; },
    choiceName: 'AllocationFactory_InternalBurnMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_InternalBurnMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.AllocationFactory_InternalBurnMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e.Splice.Api.Token.BurnMintV1.BurnMintFactory_BurnMintResult.decoder; }),
    resultEncode: function (__typed__) { return pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e.Splice.Api.Token.BurnMintV1.BurnMintFactory_BurnMintResult.encode(__typed__); },
  },
  AllocationFactory_TransferInternal: {
    template: function () { return exports.AllocationFactory; },
    choiceName: 'AllocationFactory_TransferInternal',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_TransferInternal.decoder; }),
    argumentEncode: function (__typed__) { return exports.AllocationFactory_TransferInternal.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferInstructionResult.decoder; }),
    resultEncode: function (__typed__) { return pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferInstructionResult.encode(__typed__); },
  },
  AllocationFactory_RequestBurn: {
    template: function () { return exports.AllocationFactory; },
    choiceName: 'AllocationFactory_RequestBurn',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_RequestBurn.decoder; }),
    argumentEncode: function (__typed__) { return exports.AllocationFactory_RequestBurn.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_RequestBurn_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AllocationFactory_RequestBurn_Result.encode(__typed__); },
  },
  AllocationFactory_OfferBurn: {
    template: function () { return exports.AllocationFactory; },
    choiceName: 'AllocationFactory_OfferBurn',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_OfferBurn.decoder; }),
    argumentEncode: function (__typed__) { return exports.AllocationFactory_OfferBurn.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_OfferBurn_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AllocationFactory_OfferBurn_Result.encode(__typed__); },
  },
  AllocationFactory_RequestMint: {
    template: function () { return exports.AllocationFactory; },
    choiceName: 'AllocationFactory_RequestMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_RequestMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.AllocationFactory_RequestMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_RequestMint_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AllocationFactory_RequestMint_Result.encode(__typed__); },
  },
  AllocationFactory_OfferMint: {
    template: function () { return exports.AllocationFactory; },
    choiceName: 'AllocationFactory_OfferMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_OfferMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.AllocationFactory_OfferMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AllocationFactory_OfferMint_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AllocationFactory_OfferMint_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AllocationFactory; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

, pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory
, pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory
, pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e.Splice.Api.Token.BurnMintV1.BurnMintFactory
);


damlTypes.registerTemplate(exports.AllocationFactory, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);

