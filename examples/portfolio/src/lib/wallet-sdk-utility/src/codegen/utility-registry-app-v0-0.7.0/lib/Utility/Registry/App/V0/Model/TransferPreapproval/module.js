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

var pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 = require('@daml.js/splice-api-token-transfer-instruction-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');


exports.TransferPreapproval_Modify_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferPreapprovalCid: damlTypes.ContractId(exports.TransferPreapproval).decoder, }); }),
  encode: function (__typed__) {
  return {
    transferPreapprovalCid: damlTypes.ContractId(exports.TransferPreapproval).encode(__typed__.transferPreapprovalCid),
  };
}
,
};



exports.TransferPreapproval_Withdraw_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.TransferPreapproval_Modify = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newInstrumentAllowances: damlTypes.List(exports.InstrumentAllowance).decoder, }); }),
  encode: function (__typed__) {
  return {
    newInstrumentAllowances: damlTypes.List(exports.InstrumentAllowance).encode(__typed__.newInstrumentAllowances),
  };
}
,
};



exports.TransferPreapproval_Withdraw = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.TransferPreapproval = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Model.TransferPreapproval:TransferPreapproval',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Model.TransferPreapproval:TransferPreapproval',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, receiver: damlTypes.Party.decoder, instrumentAdmin: damlTypes.Party.decoder, instrumentAllowances: damlTypes.List(exports.InstrumentAllowance).decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    instrumentAdmin: damlTypes.Party.encode(__typed__.instrumentAdmin),
    instrumentAllowances: damlTypes.List(exports.InstrumentAllowance).encode(__typed__.instrumentAllowances),
  };
}
,
  TransferPreapproval_Withdraw: {
    template: function () { return exports.TransferPreapproval; },
    choiceName: 'TransferPreapproval_Withdraw',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_Withdraw.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferPreapproval_Withdraw.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_Withdraw_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferPreapproval_Withdraw_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.TransferPreapproval; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  TransferPreapproval_Modify: {
    template: function () { return exports.TransferPreapproval; },
    choiceName: 'TransferPreapproval_Modify',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_Modify.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferPreapproval_Modify.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_Modify_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferPreapproval_Modify_Result.encode(__typed__); },
  },
}

, pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory
);


damlTypes.registerTemplate(exports.TransferPreapproval, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.InstrumentAllowance = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({id: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    id: damlTypes.Text.encode(__typed__.id),
  };
}
,
};

