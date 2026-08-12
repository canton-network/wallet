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

var pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439 = require('@daml.js/splice-api-token-allocation-v2-1.0.0');
var pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520 = require('@daml.js/splice-api-token-allocation-instruction-v1-1.0.0');
var pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099 = require('@daml.js/splice-api-token-transfer-instruction-v2-1.0.0');
var pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 = require('@daml.js/splice-api-token-holding-v2-1.0.0');
var pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f = require('@daml.js/splice-api-token-metadata-v1-1.0.0');
var pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 = require('@daml.js/splice-api-token-transfer-instruction-v1-1.0.0');
var pkg5c1097a9bad0af4bcfe6d3fb0fe55112d3d11f18eae57ddfb14c20836fee226c = require('@daml.js/splice-api-token-transfer-events-v2-1.0.0');
var pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c = require('@daml.js/splice-api-token-allocation-instruction-v2-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

var Splice_Testing_Tokens_TestTokenV2_AccountConfig = require('../../../../Splice/Testing/Tokens/TestTokenV2/AccountConfig/module');
var Splice_Testing_Tokens_TestTokenV2_Transfer = require('../../../../Splice/Testing/Tokens/TestTokenV2/Transfer/module');

exports.TokenRules = damlTypes.assembleTemplate(
  {
    templateId: '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2:TokenRules',
    templateIdWithPackageId: '#a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1:Splice.Testing.Tokens.TestTokenV2:TokenRules',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        admin: damlTypes.Party.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        admin: damlTypes.Party.encode(__typed__.admin),
      };
    },
    Archive: {
      template: function () { return exports.TokenRules; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    TokenRules_OfferMint: {
      template: function () { return exports.TokenRules; },
      choiceName: 'TokenRules_OfferMint',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.TokenRules_OfferMint.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.TokenRules_OfferMint.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.TokenRules_OfferMintResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.TokenRules_OfferMintResult.encode(__typed__); },
    },
  },
  pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferFactory,
  pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory,
  pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementFactory,
  pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory,
  pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationFactory,
  pkg5c1097a9bad0af4bcfe6d3fb0fe55112d3d11f18eae57ddfb14c20836fee226c.Splice.Api.Token.TransferEventsV2.EventLog,
);

damlTypes.registerTemplate(exports.TokenRules, ['a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1', '#splice-test-token-v2']);

exports.TokenRules_OfferMint = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      receiver: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
      amount: damlTypes.Numeric(10).decoder,
      instrumentId: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.InstrumentId.decoder,
      offeredAt: damlTypes.Time.decoder,
      receiverConfig: Splice_Testing_Tokens_TestTokenV2_AccountConfig.AccountConfig.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      receiver: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.receiver),
      amount: damlTypes.Numeric(10).encode(__typed__.amount),
      instrumentId: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.InstrumentId.encode(__typed__.instrumentId),
      offeredAt: damlTypes.Time.encode(__typed__.offeredAt),
      receiverConfig: Splice_Testing_Tokens_TestTokenV2_AccountConfig.AccountConfig.encode(__typed__.receiverConfig),
    };
  },
};

exports.TokenRules_OfferMintResult = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      offerCid: damlTypes.ContractId(Splice_Testing_Tokens_TestTokenV2_Transfer.TokenTransferOffer).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      offerCid: damlTypes.ContractId(Splice_Testing_Tokens_TestTokenV2_Transfer.TokenTransferOffer).encode(__typed__.offerCid),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};
