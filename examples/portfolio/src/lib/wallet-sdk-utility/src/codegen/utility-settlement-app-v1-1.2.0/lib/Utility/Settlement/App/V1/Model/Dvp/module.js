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
var pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193 = require('@daml.js/splice-api-token-allocation-request-v1-1.0.0');
var pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d = require('@daml.js/splice-api-token-allocation-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

var Utility_Settlement_App_V1_Types = require('../../../../../../Utility/Settlement/App/V1/Types/module');


exports.RejectedDvp = damlTypes.assembleTemplate(
{
  templateId: '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:RejectedDvp',
  templateIdWithPackageId: 'f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639:Utility.Settlement.App.V1.Model.Dvp:RejectedDvp',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dvp: exports.Dvp.decoder, reason: damlTypes.Text.decoder, actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    dvp: exports.Dvp.encode(__typed__.dvp),
    reason: damlTypes.Text.encode(__typed__.reason),
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
  Archive: {
    template: function () { return exports.RejectedDvp; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedDvp, ['f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639', '#utility-settlement-app-v1']);



exports.WithdrawnDvp = damlTypes.assembleTemplate(
{
  templateId: '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:WithdrawnDvp',
  templateIdWithPackageId: 'f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639:Utility.Settlement.App.V1.Model.Dvp:WithdrawnDvp',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dvp: exports.Dvp.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    dvp: exports.Dvp.encode(__typed__.dvp),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  Archive: {
    template: function () { return exports.WithdrawnDvp; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.WithdrawnDvp, ['f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639', '#utility-settlement-app-v1']);



exports.SettledDvp = damlTypes.assembleTemplate(
{
  templateId: '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:SettledDvp',
  templateIdWithPackageId: 'f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639:Utility.Settlement.App.V1.Model.Dvp:SettledDvp',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dvp: exports.Dvp.decoder, }); }),
  encode: function (__typed__) {
  return {
    dvp: exports.Dvp.encode(__typed__.dvp),
  };
}
,
  Archive: {
    template: function () { return exports.SettledDvp; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.SettledDvp, ['f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639', '#utility-settlement-app-v1']);



exports.RejectedDvpProposal = damlTypes.assembleTemplate(
{
  templateId: '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:RejectedDvpProposal',
  templateIdWithPackageId: 'f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639:Utility.Settlement.App.V1.Model.Dvp:RejectedDvpProposal',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dvpProposal: exports.DvpProposal.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    dvpProposal: exports.DvpProposal.encode(__typed__.dvpProposal),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  Archive: {
    template: function () { return exports.RejectedDvpProposal; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedDvpProposal, ['f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639', '#utility-settlement-app-v1']);



exports.DvpProposal_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedDvpProposalCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.RejectedDvpProposal)).decoder), }); }),
  encode: function (__typed__) {
  return {
    rejectedDvpProposalCid: damlTypes.Optional(damlTypes.ContractId(exports.RejectedDvpProposal)).encode(__typed__.rejectedDvpProposalCid),
  };
}
,
};



exports.DvpProposal_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.DvpProposal_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dvpCid: damlTypes.ContractId(exports.Dvp).decoder, }); }),
  encode: function (__typed__) {
  return {
    dvpCid: damlTypes.ContractId(exports.Dvp).encode(__typed__.dvpCid),
  };
}
,
};



exports.DvpProposal_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.DvpProposal_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.DvpProposal_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.DvpProposal = damlTypes.assembleTemplate(
{
  templateId: '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:DvpProposal',
  templateIdWithPackageId: 'f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639:Utility.Settlement.App.V1.Model.Dvp:DvpProposal',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, proposer: damlTypes.Party.decoder, proposerIsBuyer: damlTypes.Bool.decoder, counterparty: damlTypes.Party.decoder, terms: exports.Terms.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    proposer: damlTypes.Party.encode(__typed__.proposer),
    proposerIsBuyer: damlTypes.Bool.encode(__typed__.proposerIsBuyer),
    counterparty: damlTypes.Party.encode(__typed__.counterparty),
    terms: exports.Terms.encode(__typed__.terms),
  };
}
,
  Archive: {
    template: function () { return exports.DvpProposal; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  DvpProposal_Cancel: {
    template: function () { return exports.DvpProposal; },
    choiceName: 'DvpProposal_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.DvpProposal_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.DvpProposal_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.DvpProposal_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.DvpProposal_Cancel_Result.encode(__typed__); },
  },
  DvpProposal_Accept: {
    template: function () { return exports.DvpProposal; },
    choiceName: 'DvpProposal_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.DvpProposal_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.DvpProposal_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.DvpProposal_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.DvpProposal_Accept_Result.encode(__typed__); },
  },
  DvpProposal_Reject: {
    template: function () { return exports.DvpProposal; },
    choiceName: 'DvpProposal_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.DvpProposal_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.DvpProposal_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.DvpProposal_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.DvpProposal_Reject_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.DvpProposal, ['f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639', '#utility-settlement-app-v1']);



exports.Dvp_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.Dvp_Settle_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({settledDvpCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.SettledDvp)).decoder), }); }),
  encode: function (__typed__) {
  return {
    settledDvpCid: damlTypes.Optional(damlTypes.ContractId(exports.SettledDvp)).encode(__typed__.settledDvpCid),
  };
}
,
};



exports.Dvp_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({allocationCids: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).decoder, extraArgss: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder, payload: pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest_Withdraw.decoder, }); }),
  encode: function (__typed__) {
  return {
    allocationCids: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).encode(__typed__.allocationCids),
    extraArgss: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.extraArgss),
    payload: pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest_Withdraw.encode(__typed__.payload),
  };
}
,
};



exports.Dvp_Settle = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({allocationCids: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).decoder, extraArgss: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder, }); }),
  encode: function (__typed__) {
  return {
    allocationCids: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).encode(__typed__.allocationCids),
    extraArgss: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.extraArgss),
  };
}
,
};



exports.Dvp = damlTypes.assembleTemplate(
{
  templateId: '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:Dvp',
  templateIdWithPackageId: 'f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639:Utility.Settlement.App.V1.Model.Dvp:Dvp',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, buyer: damlTypes.Party.decoder, seller: damlTypes.Party.decoder, terms: exports.Terms.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    buyer: damlTypes.Party.encode(__typed__.buyer),
    seller: damlTypes.Party.encode(__typed__.seller),
    terms: exports.Terms.encode(__typed__.terms),
  };
}
,
  Dvp_Settle: {
    template: function () { return exports.Dvp; },
    choiceName: 'Dvp_Settle',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Dvp_Settle.decoder; }),
    argumentEncode: function (__typed__) { return exports.Dvp_Settle.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Dvp_Settle_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.Dvp_Settle_Result.encode(__typed__); },
  },
  Dvp_Cancel: {
    template: function () { return exports.Dvp; },
    choiceName: 'Dvp_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Dvp_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.Dvp_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Dvp_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.Dvp_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.Dvp; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

, pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest
);


damlTypes.registerTemplate(exports.Dvp, ['f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639', '#utility-settlement-app-v1']);



exports.Terms = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({id: damlTypes.Text.decoder, deliveries: damlTypes.List(Utility_Settlement_App_V1_Types.InstrumentQuantity).decoder, payments: damlTypes.List(Utility_Settlement_App_V1_Types.InstrumentQuantity).decoder, createdAt: damlTypes.Time.decoder, allocateBefore: damlTypes.Time.decoder, settleBefore: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    id: damlTypes.Text.encode(__typed__.id),
    deliveries: damlTypes.List(Utility_Settlement_App_V1_Types.InstrumentQuantity).encode(__typed__.deliveries),
    payments: damlTypes.List(Utility_Settlement_App_V1_Types.InstrumentQuantity).encode(__typed__.payments),
    createdAt: damlTypes.Time.encode(__typed__.createdAt),
    allocateBefore: damlTypes.Time.encode(__typed__.allocateBefore),
    settleBefore: damlTypes.Time.encode(__typed__.settleBefore),
  };
}
,
};

