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
var pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 = require('@daml.js/splice-api-token-holding-v2-1.0.0');
var pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d = require('@daml.js/splice-api-token-allocation-v1-1.0.0');
var pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c = require('@daml.js/splice-api-token-allocation-instruction-v2-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

exports.AllocationKind = {
  CreateV1Allocation: 'CreateV1Allocation',
  CreateV2Allocation: 'CreateV2Allocation',
  keys: ['CreateV1Allocation', 'CreateV2Allocation'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.AllocationKind.CreateV1Allocation),
      jtv.constant(exports.AllocationKind.CreateV2Allocation),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};

exports.TokenAllocationInstructionV1 = damlTypes.assembleTemplate(
  {
    templateId: '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationInstructionV1',
    templateIdWithPackageId: '#a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationInstructionV1',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        instrV2: exports.TokenAllocationInstructionV2.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        instrV2: exports.TokenAllocationInstructionV2.encode(__typed__.instrV2),
      };
    },
    Archive: {
      template: function () { return exports.TokenAllocationInstructionV1; },
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
  },
  pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction,
  pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationInstruction,
);

damlTypes.registerTemplate(exports.TokenAllocationInstructionV1, ['a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1', '#splice-test-token-v2']);

exports.TokenAllocationInstructionV2 = damlTypes.assembleTemplate(
  {
    templateId: '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationInstructionV2',
    templateIdWithPackageId: '#a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationInstructionV2',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        originalInstructionCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction)).decoder),
        actionAuthorizers: damlTypes.Map(pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionAction, damlTypes.List(damlTypes.Party)).decoder,
        availableActions: damlTypes.Map(pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionAction, damlTypes.List(damlTypes.List(damlTypes.Party))).decoder,
        inputHoldingCids: damlTypes.TextMap(damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding))).decoder,
        settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.decoder,
        allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification.decoder,
        admin: damlTypes.Party.decoder,
        requestedAt: damlTypes.Time.decoder,
        allocateBefore: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder),
      });
    }),
    encode: function (__typed__) {
      return {
        originalInstructionCid: damlTypes.Optional(damlTypes.ContractId(pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction)).encode(__typed__.originalInstructionCid),
        actionAuthorizers: damlTypes.Map(pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionAction, damlTypes.List(damlTypes.Party)).encode(__typed__.actionAuthorizers),
        availableActions: damlTypes.Map(pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionAction, damlTypes.List(damlTypes.List(damlTypes.Party))).encode(__typed__.availableActions),
        inputHoldingCids: damlTypes.TextMap(damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding))).encode(__typed__.inputHoldingCids),
        settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.encode(__typed__.settlement),
        allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification.encode(__typed__.allocation),
        admin: damlTypes.Party.encode(__typed__.admin),
        requestedAt: damlTypes.Time.encode(__typed__.requestedAt),
        allocateBefore: damlTypes.Optional(damlTypes.Time).encode(__typed__.allocateBefore),
      };
    },
    Archive: {
      template: function () { return exports.TokenAllocationInstructionV2; },
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
  },
  pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction,
);

damlTypes.registerTemplate(exports.TokenAllocationInstructionV2, ['a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1', '#splice-test-token-v2']);

exports.TokenAllocationV1 = damlTypes.assembleTemplate(
  {
    templateId: '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationV1',
    templateIdWithPackageId: '#a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationV1',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        allocationV2: exports.TokenAllocationV2.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        allocationV2: exports.TokenAllocationV2.encode(__typed__.allocationV2),
      };
    },
    Archive: {
      template: function () { return exports.TokenAllocationV1; },
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
  },
  pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation,
  pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation,
);

damlTypes.registerTemplate(exports.TokenAllocationV1, ['a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1', '#splice-test-token-v2']);

exports.TokenAllocationV2 = damlTypes.assembleTemplate(
  {
    templateId: '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationV2',
    templateIdWithPackageId: '#a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationV2',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        originalAllocationCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation)).decoder),
        actionAuthorizers: damlTypes.Map(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationAction, damlTypes.List(damlTypes.Party)).decoder,
        availableActions: damlTypes.Map(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationAction, damlTypes.List(damlTypes.List(damlTypes.Party))).decoder,
        lockedTokens: damlTypes.TextMap(damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding))).decoder,
        settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.decoder,
        allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification.decoder,
        requestedAt: damlTypes.Time.decoder,
        allocateBefore: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder),
        numIterations: damlTypes.Int.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        originalAllocationCid: damlTypes.Optional(damlTypes.ContractId(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation)).encode(__typed__.originalAllocationCid),
        actionAuthorizers: damlTypes.Map(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationAction, damlTypes.List(damlTypes.Party)).encode(__typed__.actionAuthorizers),
        availableActions: damlTypes.Map(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationAction, damlTypes.List(damlTypes.List(damlTypes.Party))).encode(__typed__.availableActions),
        lockedTokens: damlTypes.TextMap(damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding))).encode(__typed__.lockedTokens),
        settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.encode(__typed__.settlement),
        allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification.encode(__typed__.allocation),
        requestedAt: damlTypes.Time.encode(__typed__.requestedAt),
        allocateBefore: damlTypes.Optional(damlTypes.Time).encode(__typed__.allocateBefore),
        numIterations: damlTypes.Int.encode(__typed__.numIterations),
      };
    },
    Archive: {
      template: function () { return exports.TokenAllocationV2; },
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
  },
  pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation,
);

damlTypes.registerTemplate(exports.TokenAllocationV2, ['a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1', '#splice-test-token-v2']);
