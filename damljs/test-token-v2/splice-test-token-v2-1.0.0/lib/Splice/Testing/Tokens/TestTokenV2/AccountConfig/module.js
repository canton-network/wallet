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
var pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099 = require('@daml.js/splice-api-token-transfer-instruction-v2-1.0.0');
var pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 = require('@daml.js/splice-api-token-holding-v2-1.0.0');
var pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f = require('@daml.js/splice-api-token-metadata-v1-1.0.0');
var pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c = require('@daml.js/splice-api-token-allocation-instruction-v2-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

exports.AccountConfig = damlTypes.assembleTemplate(
  {
    templateId: '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.AccountConfig:AccountConfig',
    templateIdWithPackageId: '#a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1:Splice.Testing.Tokens.TestTokenV2.AccountConfig:AccountConfig',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        admin: damlTypes.Party.decoder,
        account: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
        ownerConfig: exports.PartyConfig.decoder,
        providerConfig: exports.PartyConfig.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        admin: damlTypes.Party.encode(__typed__.admin),
        account: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.account),
        ownerConfig: exports.PartyConfig.encode(__typed__.ownerConfig),
        providerConfig: exports.PartyConfig.encode(__typed__.providerConfig),
      };
    },
    Archive: {
      template: function () { return exports.AccountConfig; },
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
    AuthorizeAllocationAction: {
      template: function () { return exports.AccountConfig; },
      choiceName: 'AuthorizeAllocationAction',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AuthorizeAllocationAction.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AuthorizeAllocationAction.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationResult.decoder;
      }),
      resultEncode: function (__typed__) { return pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationResult.encode(__typed__); },
    },
    AuthorizeAllocationInstructionAction: {
      template: function () { return exports.AccountConfig; },
      choiceName: 'AuthorizeAllocationInstructionAction',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AuthorizeAllocationInstructionAction.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AuthorizeAllocationInstructionAction.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionResult.decoder;
      }),
      resultEncode: function (__typed__) { return pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionResult.encode(__typed__); },
    },
    AuthorizeTransferInstructionAction: {
      template: function () { return exports.AccountConfig; },
      choiceName: 'AuthorizeTransferInstructionAction',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AuthorizeTransferInstructionAction.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AuthorizeTransferInstructionAction.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionResult.decoder;
      }),
      resultEncode: function (__typed__) { return pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionResult.encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.AccountConfig, ['a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1', '#splice-test-token-v2']);

exports.AccountProposal = damlTypes.assembleTemplate(
  {
    templateId: '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.AccountConfig:AccountProposal',
    templateIdWithPackageId: '#a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1:Splice.Testing.Tokens.TestTokenV2.AccountConfig:AccountProposal',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        config: exports.AccountConfig.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        config: exports.AccountConfig.encode(__typed__.config),
      };
    },
    AccountProposal_Accept: {
      template: function () { return exports.AccountProposal; },
      choiceName: 'AccountProposal_Accept',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AccountProposal_Accept.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AccountProposal_Accept.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AccountProposal_Accept_Result.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AccountProposal_Accept_Result.encode(__typed__); },
    },
    AccountProposal_Reject: {
      template: function () { return exports.AccountProposal; },
      choiceName: 'AccountProposal_Reject',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AccountProposal_Reject.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AccountProposal_Reject.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AccountProposal_Reject_Result.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AccountProposal_Reject_Result.encode(__typed__); },
    },
    AccountProposal_Withdraw: {
      template: function () { return exports.AccountProposal; },
      choiceName: 'AccountProposal_Withdraw',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AccountProposal_Withdraw.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AccountProposal_Withdraw.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AccountProposal_Withdraw_Result.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AccountProposal_Withdraw_Result.encode(__typed__); },
    },
    Archive: {
      template: function () { return exports.AccountProposal; },
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
);

damlTypes.registerTemplate(exports.AccountProposal, ['a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1', '#splice-test-token-v2']);

exports.AccountProposal_Accept = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.AccountProposal_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      accountConfig: damlTypes.ContractId(exports.AccountConfig).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      accountConfig: damlTypes.ContractId(exports.AccountConfig).encode(__typed__.accountConfig),
    };
  },
};

exports.AccountProposal_Reject = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.AccountProposal_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.AccountProposal_Withdraw = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.AccountProposal_Withdraw_Result = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.AllocationInstructionState = {
  AIS_Init: 'AIS_Init',
  AIS_Withdrawn: 'AIS_Withdrawn',
  AIS_Accepted: 'AIS_Accepted',
  keys: ['AIS_Init', 'AIS_Withdrawn', 'AIS_Accepted'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.AllocationInstructionState.AIS_Init),
      jtv.constant(exports.AllocationInstructionState.AIS_Withdrawn),
      jtv.constant(exports.AllocationInstructionState.AIS_Accepted),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};

exports.AllocationState = {
  AS_Init: 'AS_Init',
  AS_Withdrawn: 'AS_Withdrawn',
  AS_Cancelled: 'AS_Cancelled',
  AS_Settled: 'AS_Settled',
  keys: ['AS_Init', 'AS_Withdrawn', 'AS_Cancelled', 'AS_Settled'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.AllocationState.AS_Init),
      jtv.constant(exports.AllocationState.AS_Withdrawn),
      jtv.constant(exports.AllocationState.AS_Cancelled),
      jtv.constant(exports.AllocationState.AS_Settled),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};

exports.AuthSpec = function (actionType) {
  return ({
    decoder: damlTypes.lazyMemo(function () {
      return jtv.oneOf(
        jtv.object({
          tag: jtv.constant("STAS_Account"),
          value: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
        }),
        jtv.object({
          tag: jtv.constant("STAS_Action"),
          value: actionType.decoder,
        }),
        jtv.object({
          tag: jtv.constant("STAS_Parties"),
          value: damlTypes.List(damlTypes.Party).decoder,
        }),
      );
    }),
    encode: function (__typed__) {
      switch(__typed__.tag) {
        case 'STAS_Account': return {tag: __typed__.tag, value: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.value)};
        case 'STAS_Action': return {tag: __typed__.tag, value: actionType.encode(__typed__.value)};
        case 'STAS_Parties': return {tag: __typed__.tag, value: damlTypes.List(damlTypes.Party).encode(__typed__.value)};
        default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type AuthSpec';
      }
    },
  });
};

exports.AuthorizeAllocationAction = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
      authorizer: damlTypes.Party.decoder,
      action: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationAction.decoder,
      allocationCid: damlTypes.ContractId(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
      authorizer: damlTypes.Party.encode(__typed__.authorizer),
      action: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationAction.encode(__typed__.action),
      allocationCid: damlTypes.ContractId(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation).encode(__typed__.allocationCid),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.AuthorizeAllocationInstructionAction = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
      authorizer: damlTypes.Party.decoder,
      action: pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionAction.decoder,
      instrCid: damlTypes.ContractId(pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
      authorizer: damlTypes.Party.encode(__typed__.authorizer),
      action: pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionAction.encode(__typed__.action),
      instrCid: damlTypes.ContractId(pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction).encode(__typed__.instrCid),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.AuthorizeTransferInstructionAction = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
      authorizer: damlTypes.Party.decoder,
      action: pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionAction.decoder,
      instrCid: damlTypes.ContractId(pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstruction).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
      authorizer: damlTypes.Party.encode(__typed__.authorizer),
      action: pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionAction.encode(__typed__.action),
      instrCid: damlTypes.ContractId(pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstruction).encode(__typed__.instrCid),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.PartyConfig = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      canInitiate: damlTypes.Bool.decoder,
      mustApprove: damlTypes.Bool.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      canInitiate: damlTypes.Bool.encode(__typed__.canInitiate),
      mustApprove: damlTypes.Bool.encode(__typed__.mustApprove),
    };
  },
};

exports.TransferInstructionState = {
  TIS_Init: 'TIS_Init',
  TIS_Authorized: 'TIS_Authorized',
  TIS_Withdrawn: 'TIS_Withdrawn',
  TIS_Rejected: 'TIS_Rejected',
  TIS_Accepted: 'TIS_Accepted',
  keys: ['TIS_Init', 'TIS_Authorized', 'TIS_Withdrawn', 'TIS_Rejected', 'TIS_Accepted'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.TransferInstructionState.TIS_Init),
      jtv.constant(exports.TransferInstructionState.TIS_Authorized),
      jtv.constant(exports.TransferInstructionState.TIS_Withdrawn),
      jtv.constant(exports.TransferInstructionState.TIS_Rejected),
      jtv.constant(exports.TransferInstructionState.TIS_Accepted),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};
