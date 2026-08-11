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

var pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 = require('@daml.js/splice-api-token-holding-v2-1.0.0');
var pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f = require('@daml.js/splice-api-token-metadata-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

exports.Allocation = damlTypes.assembleInterface(
  '#splice-api-token-allocation-v2:Splice.Api.Token.AllocationV2:Allocation',
  '#051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439:Splice.Api.Token.AllocationV2:Allocation',
  function () { return exports.AllocationView; },
  {
    Allocation_Cancel: {
      template: function () { return exports.Allocation; },
      choiceName: 'Allocation_Cancel',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Allocation_Cancel.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Allocation_Cancel.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationResult.encode(__typed__); },
    },
    Allocation_Settle: {
      template: function () { return exports.Allocation; },
      choiceName: 'Allocation_Settle',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Allocation_Settle.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Allocation_Settle.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationResult.encode(__typed__); },
    },
    Allocation_Withdraw: {
      template: function () { return exports.Allocation; },
      choiceName: 'Allocation_Withdraw',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Allocation_Withdraw.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Allocation_Withdraw.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationResult.encode(__typed__); },
    },
    Archive: {
      template: function () { return exports.Allocation; },
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
  }
);

exports.SettlementFactory = damlTypes.assembleInterface(
  '#splice-api-token-allocation-v2:Splice.Api.Token.AllocationV2:SettlementFactory',
  '#051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439:Splice.Api.Token.AllocationV2:SettlementFactory',
  function () { return exports.SettlementFactoryView; },
  {
    Archive: {
      template: function () { return exports.SettlementFactory; },
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
    SettlementFactory_PublicFetch: {
      template: function () { return exports.SettlementFactory; },
      choiceName: 'SettlementFactory_PublicFetch',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.SettlementFactory_PublicFetch.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.SettlementFactory_PublicFetch.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.SettlementFactoryView.decoder;
      }),
      resultEncode: function (__typed__) { return exports.SettlementFactoryView.encode(__typed__); },
    },
    SettlementFactory_SettleBatch: {
      template: function () { return exports.SettlementFactory; },
      choiceName: 'SettlementFactory_SettleBatch',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.SettlementFactory_SettleBatch.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.SettlementFactory_SettleBatch.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.SettlementFactory_SettleBatchResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.SettlementFactory_SettleBatchResult.encode(__typed__); },
    },
  }
);

exports.AllocationAction = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.object({
        tag: jtv.constant("AA_Settle"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AA_Cancel"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AA_Withdraw"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AA_Custom"),
        value: exports.AllocationAction.AA_Custom.decoder,
      }),
    );
  }),
  encode: function (__typed__) {
    switch(__typed__.tag) {
      case 'AA_Settle': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'AA_Cancel': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'AA_Withdraw': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'AA_Custom': return {tag: __typed__.tag, value: exports.AllocationAction.AA_Custom.encode(__typed__.value)};
      default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type AllocationAction';
    }
  },
  AA_Custom: {
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        id: damlTypes.Text.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        id: damlTypes.Text.encode(__typed__.id),
      };
    },
  },
};

exports.AllocationResult = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      output: exports.AllocationResult_Output.decoder,
      authorizerHoldingCids: damlTypes.TextMap(damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding))).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      output: exports.AllocationResult_Output.encode(__typed__.output),
      authorizerHoldingCids: damlTypes.TextMap(damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding))).encode(__typed__.authorizerHoldingCids),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.AllocationResult_Output = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.object({
        tag: jtv.constant("AllocationResult_Pending"),
        value: exports.AllocationResult_Output.AllocationResult_Pending.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AllocationResult_Settled"),
        value: exports.AllocationResult_Output.AllocationResult_Settled.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AllocationResult_Cancelled"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AllocationResult_Withdrawn"),
        value: damlTypes.Unit.decoder,
      }),
    );
  }),
  encode: function (__typed__) {
    switch(__typed__.tag) {
      case 'AllocationResult_Pending': return {tag: __typed__.tag, value: exports.AllocationResult_Output.AllocationResult_Pending.encode(__typed__.value)};
      case 'AllocationResult_Settled': return {tag: __typed__.tag, value: exports.AllocationResult_Output.AllocationResult_Settled.encode(__typed__.value)};
      case 'AllocationResult_Cancelled': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'AllocationResult_Withdrawn': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type AllocationResult_Output';
    }
  },
  AllocationResult_Pending: {
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        allocationCid: damlTypes.ContractId(exports.Allocation).decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        allocationCid: damlTypes.ContractId(exports.Allocation).encode(__typed__.allocationCid),
      };
    },
  },
  AllocationResult_Settled: {
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        nextIterationAllocationCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.Allocation)).decoder),
      });
    }),
    encode: function (__typed__) {
      return {
        nextIterationAllocationCid: damlTypes.Optional(damlTypes.ContractId(exports.Allocation)).encode(__typed__.nextIterationAllocationCid),
      };
    },
  },
};

exports.AllocationSpecification = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      admin: damlTypes.Party.decoder,
      authorizer: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
      transferLegSides: damlTypes.List(exports.TransferLegSide).decoder,
      settlementDeadline: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder),
      nextIterationFunding: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.TextMap(damlTypes.Numeric(10))).decoder),
      committed: damlTypes.Bool.decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      admin: damlTypes.Party.encode(__typed__.admin),
      authorizer: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.authorizer),
      transferLegSides: damlTypes.List(exports.TransferLegSide).encode(__typed__.transferLegSides),
      settlementDeadline: damlTypes.Optional(damlTypes.Time).encode(__typed__.settlementDeadline),
      nextIterationFunding: damlTypes.Optional(damlTypes.TextMap(damlTypes.Numeric(10))).encode(__typed__.nextIterationFunding),
      committed: damlTypes.Bool.encode(__typed__.committed),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.AllocationView = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      originalAllocationCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.Allocation)).decoder),
      settlement: exports.SettlementInfo.decoder,
      allocation: exports.AllocationSpecification.decoder,
      holdingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).decoder,
      createdAt: damlTypes.Time.decoder,
      numIterations: damlTypes.Int.decoder,
      expiresAt: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder),
      availableActions: damlTypes.Map(exports.AllocationAction, damlTypes.List(damlTypes.List(damlTypes.Party))).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      originalAllocationCid: damlTypes.Optional(damlTypes.ContractId(exports.Allocation)).encode(__typed__.originalAllocationCid),
      settlement: exports.SettlementInfo.encode(__typed__.settlement),
      allocation: exports.AllocationSpecification.encode(__typed__.allocation),
      holdingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).encode(__typed__.holdingCids),
      createdAt: damlTypes.Time.encode(__typed__.createdAt),
      numIterations: damlTypes.Int.encode(__typed__.numIterations),
      expiresAt: damlTypes.Optional(damlTypes.Time).encode(__typed__.expiresAt),
      availableActions: damlTypes.Map(exports.AllocationAction, damlTypes.List(damlTypes.List(damlTypes.Party))).encode(__typed__.availableActions),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.Allocation_Cancel = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actors: damlTypes.List(damlTypes.Party).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.Allocation_Settle = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actors: damlTypes.List(damlTypes.Party).decoder,
      extraTransferLegSides: damlTypes.List(exports.TransferLegSide).decoder,
      nextIterationFunding: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.TextMap(damlTypes.Numeric(10))).decoder),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
      extraTransferLegSides: damlTypes.List(exports.TransferLegSide).encode(__typed__.extraTransferLegSides),
      nextIterationFunding: damlTypes.Optional(damlTypes.TextMap(damlTypes.Numeric(10))).encode(__typed__.nextIterationFunding),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.Allocation_Withdraw = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actors: damlTypes.List(damlTypes.Party).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.FinalizedAllocation = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      allocationCid: damlTypes.ContractId(exports.Allocation).decoder,
      extraTransferLegSides: damlTypes.List(exports.TransferLegSide).decoder,
      nextIterationFunding: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.TextMap(damlTypes.Numeric(10))).decoder),
    });
  }),
  encode: function (__typed__) {
    return {
      allocationCid: damlTypes.ContractId(exports.Allocation).encode(__typed__.allocationCid),
      extraTransferLegSides: damlTypes.List(exports.TransferLegSide).encode(__typed__.extraTransferLegSides),
      nextIterationFunding: damlTypes.Optional(damlTypes.TextMap(damlTypes.Numeric(10))).encode(__typed__.nextIterationFunding),
    };
  },
};

exports.SettlementFactoryView = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      admin: damlTypes.Party.decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      admin: damlTypes.Party.encode(__typed__.admin),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.SettlementFactory_PublicFetch = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actors: damlTypes.List(damlTypes.Party).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
    };
  },
};

exports.SettlementFactory_SettleBatch = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      settlement: exports.SettlementInfo.decoder,
      transferLegs: damlTypes.List(exports.TransferLeg).decoder,
      allocations: damlTypes.List(exports.FinalizedAllocation).decoder,
      actors: damlTypes.List(damlTypes.Party).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      settlement: exports.SettlementInfo.encode(__typed__.settlement),
      transferLegs: damlTypes.List(exports.TransferLeg).encode(__typed__.transferLegs),
      allocations: damlTypes.List(exports.FinalizedAllocation).encode(__typed__.allocations),
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.SettlementFactory_SettleBatchResult = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      allocationSettleResults: damlTypes.List(exports.AllocationResult).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      allocationSettleResults: damlTypes.List(exports.AllocationResult).encode(__typed__.allocationSettleResults),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.SettlementInfo = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      executors: damlTypes.List(damlTypes.Party).decoder,
      id: damlTypes.Text.decoder,
      cid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.AnyContract)).decoder),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      executors: damlTypes.List(damlTypes.Party).encode(__typed__.executors),
      id: damlTypes.Text.encode(__typed__.id),
      cid: damlTypes.Optional(damlTypes.ContractId(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.AnyContract)).encode(__typed__.cid),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.TransferLeg = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      transferLegId: damlTypes.Text.decoder,
      sender: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
      receiver: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
      amount: damlTypes.Numeric(10).decoder,
      instrumentId: damlTypes.Text.decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      transferLegId: damlTypes.Text.encode(__typed__.transferLegId),
      sender: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.sender),
      receiver: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.receiver),
      amount: damlTypes.Numeric(10).encode(__typed__.amount),
      instrumentId: damlTypes.Text.encode(__typed__.instrumentId),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.TransferLegSide = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      transferLegId: damlTypes.Text.decoder,
      side: exports.TransferSide.decoder,
      otherside: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
      amount: damlTypes.Numeric(10).decoder,
      instrumentId: damlTypes.Text.decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      transferLegId: damlTypes.Text.encode(__typed__.transferLegId),
      side: exports.TransferSide.encode(__typed__.side),
      otherside: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.otherside),
      amount: damlTypes.Numeric(10).encode(__typed__.amount),
      instrumentId: damlTypes.Text.encode(__typed__.instrumentId),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.TransferSide = {
  SenderSide: 'SenderSide',
  ReceiverSide: 'ReceiverSide',
  keys: ['SenderSide', 'ReceiverSide'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.TransferSide.SenderSide),
      jtv.constant(exports.TransferSide.ReceiverSide),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};
