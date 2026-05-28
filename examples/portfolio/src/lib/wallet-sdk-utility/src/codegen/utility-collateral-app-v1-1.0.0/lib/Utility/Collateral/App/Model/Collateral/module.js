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

var Utility_Collateral_App_Model_State = require('../../../../../Utility/Collateral/App/Model/State/module');
var Utility_Collateral_App_Types = require('../../../../../Utility/Collateral/App/Types/module');


exports.ExpectedCollateralState = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, partyA: damlTypes.Party.decoder, partyB: damlTypes.Party.decoder, id: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    partyA: damlTypes.Party.encode(__typed__.partyA),
    partyB: damlTypes.Party.encode(__typed__.partyB),
    id: damlTypes.Text.encode(__typed__.id),
  };
}
,
};



exports.FailedCollateralTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:FailedCollateralTransfer',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Model.Collateral:FailedCollateralTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({partyA: damlTypes.Party.decoder, partyB: damlTypes.Party.decoder, operator: damlTypes.Party.decoder, agreementId: damlTypes.Text.decoder, id: damlTypes.Text.decoder, failedPledges: damlTypes.List(Utility_Collateral_App_Types.InstrumentQuantity).decoder, }); }),
  encode: function (__typed__) {
  return {
    partyA: damlTypes.Party.encode(__typed__.partyA),
    partyB: damlTypes.Party.encode(__typed__.partyB),
    operator: damlTypes.Party.encode(__typed__.operator),
    agreementId: damlTypes.Text.encode(__typed__.agreementId),
    id: damlTypes.Text.encode(__typed__.id),
    failedPledges: damlTypes.List(Utility_Collateral_App_Types.InstrumentQuantity).encode(__typed__.failedPledges),
  };
}
,
  Archive: {
    template: function () { return exports.FailedCollateralTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.FailedCollateralTransfer, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);



exports.ExecutedCollateralTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:ExecutedCollateralTransfer',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Model.Collateral:ExecutedCollateralTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({partyA: damlTypes.Party.decoder, partyB: damlTypes.Party.decoder, operator: damlTypes.Party.decoder, agreementId: damlTypes.Text.decoder, id: damlTypes.Text.decoder, settledPositions: damlTypes.List(Utility_Collateral_App_Types.CollateralPosition).decoder, }); }),
  encode: function (__typed__) {
  return {
    partyA: damlTypes.Party.encode(__typed__.partyA),
    partyB: damlTypes.Party.encode(__typed__.partyB),
    operator: damlTypes.Party.encode(__typed__.operator),
    agreementId: damlTypes.Text.encode(__typed__.agreementId),
    id: damlTypes.Text.encode(__typed__.id),
    settledPositions: damlTypes.List(Utility_Collateral_App_Types.CollateralPosition).encode(__typed__.settledPositions),
  };
}
,
  Archive: {
    template: function () { return exports.ExecutedCollateralTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExecutedCollateralTransfer, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);



exports.InstructedCollateral_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.InstructedCollateral_ExecuteTransfer_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).decoder, }); }),
  encode: function (__typed__) {
  return {
    collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).encode(__typed__.collateralStateCid),
  };
}
,
};



exports.InstructedCollateral_ExecuteTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, allocations: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).decoder, executeTransferArgs: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder, collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    allocations: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).encode(__typed__.allocations),
    executeTransferArgs: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.executeTransferArgs),
    collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).encode(__typed__.collateralStateCid),
  };
}
,
};



exports.InstructedCollateral_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, allocations: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).decoder, extraArgs: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    allocations: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).encode(__typed__.allocations),
    extraArgs: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.extraArgs),
  };
}
,
};



exports.InstructedCollateral = damlTypes.assembleTemplate(
{
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:InstructedCollateral',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Model.Collateral:InstructedCollateral',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({partyA: damlTypes.Party.decoder, partyB: damlTypes.Party.decoder, operator: damlTypes.Party.decoder, agreementId: damlTypes.Text.decoder, id: damlTypes.Text.decoder, instructedPositions: damlTypes.List(Utility_Collateral_App_Types.CollateralPosition).decoder, createdAt: damlTypes.Time.decoder, allocateBefore: damlTypes.Time.decoder, settleBefore: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    partyA: damlTypes.Party.encode(__typed__.partyA),
    partyB: damlTypes.Party.encode(__typed__.partyB),
    operator: damlTypes.Party.encode(__typed__.operator),
    agreementId: damlTypes.Text.encode(__typed__.agreementId),
    id: damlTypes.Text.encode(__typed__.id),
    instructedPositions: damlTypes.List(Utility_Collateral_App_Types.CollateralPosition).encode(__typed__.instructedPositions),
    createdAt: damlTypes.Time.encode(__typed__.createdAt),
    allocateBefore: damlTypes.Time.encode(__typed__.allocateBefore),
    settleBefore: damlTypes.Time.encode(__typed__.settleBefore),
  };
}
,
  InstructedCollateral_ExecuteTransfer: {
    template: function () { return exports.InstructedCollateral; },
    choiceName: 'InstructedCollateral_ExecuteTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.InstructedCollateral_ExecuteTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.InstructedCollateral_ExecuteTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.InstructedCollateral_ExecuteTransfer_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.InstructedCollateral_ExecuteTransfer_Result.encode(__typed__); },
  },
  InstructedCollateral_Cancel: {
    template: function () { return exports.InstructedCollateral; },
    choiceName: 'InstructedCollateral_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.InstructedCollateral_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.InstructedCollateral_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.InstructedCollateral_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.InstructedCollateral_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.InstructedCollateral; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

, pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest
);


damlTypes.registerTemplate(exports.InstructedCollateral, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);



exports.CollateralAgreementChangeRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CollateralAgreementChangeRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.CollateralAgreementChangeRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({collateralAgreementCid: damlTypes.ContractId(exports.CollateralAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    collateralAgreementCid: damlTypes.ContractId(exports.CollateralAgreement).encode(__typed__.collateralAgreementCid),
  };
}
,
};



exports.CollateralAgreementChangeRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CollateralAgreementChangeRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.CollateralAgreementChangeRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CollateralAgreementChangeRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:CollateralAgreementChangeRequest',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Model.Collateral:CollateralAgreementChangeRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, requestor: damlTypes.Party.decoder, counterparty: damlTypes.Party.decoder, id: damlTypes.Text.decoder, terms: Utility_Collateral_App_Types.Terms.decoder, collateralAgreementCid: damlTypes.ContractId(exports.CollateralAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    requestor: damlTypes.Party.encode(__typed__.requestor),
    counterparty: damlTypes.Party.encode(__typed__.counterparty),
    id: damlTypes.Text.encode(__typed__.id),
    terms: Utility_Collateral_App_Types.Terms.encode(__typed__.terms),
    collateralAgreementCid: damlTypes.ContractId(exports.CollateralAgreement).encode(__typed__.collateralAgreementCid),
  };
}
,
  CollateralAgreementChangeRequest_Accept: {
    template: function () { return exports.CollateralAgreementChangeRequest; },
    choiceName: 'CollateralAgreementChangeRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementChangeRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.CollateralAgreementChangeRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementChangeRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CollateralAgreementChangeRequest_Accept_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.CollateralAgreementChangeRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  CollateralAgreementChangeRequest_Reject: {
    template: function () { return exports.CollateralAgreementChangeRequest; },
    choiceName: 'CollateralAgreementChangeRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementChangeRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.CollateralAgreementChangeRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementChangeRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CollateralAgreementChangeRequest_Reject_Result.encode(__typed__); },
  },
  CollateralAgreementChangeRequest_Cancel: {
    template: function () { return exports.CollateralAgreementChangeRequest; },
    choiceName: 'CollateralAgreementChangeRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementChangeRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.CollateralAgreementChangeRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementChangeRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CollateralAgreementChangeRequest_Cancel_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CollateralAgreementChangeRequest, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);



exports.CollateralAgreementRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CollateralAgreementRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.CollateralAgreementRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({collateralAgreementCid: damlTypes.ContractId(exports.CollateralAgreement).decoder, collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).decoder, }); }),
  encode: function (__typed__) {
  return {
    collateralAgreementCid: damlTypes.ContractId(exports.CollateralAgreement).encode(__typed__.collateralAgreementCid),
    collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).encode(__typed__.collateralStateCid),
  };
}
,
};



exports.CollateralAgreementRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CollateralAgreementRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.CollateralAgreementRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CollateralAgreementRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:CollateralAgreementRequest',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Model.Collateral:CollateralAgreementRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, requestor: damlTypes.Party.decoder, counterparty: damlTypes.Party.decoder, id: damlTypes.Text.decoder, requestorIsPartyA: damlTypes.Bool.decoder, terms: Utility_Collateral_App_Types.Terms.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    requestor: damlTypes.Party.encode(__typed__.requestor),
    counterparty: damlTypes.Party.encode(__typed__.counterparty),
    id: damlTypes.Text.encode(__typed__.id),
    requestorIsPartyA: damlTypes.Bool.encode(__typed__.requestorIsPartyA),
    terms: Utility_Collateral_App_Types.Terms.encode(__typed__.terms),
  };
}
,
  CollateralAgreementRequest_Accept: {
    template: function () { return exports.CollateralAgreementRequest; },
    choiceName: 'CollateralAgreementRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.CollateralAgreementRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CollateralAgreementRequest_Accept_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.CollateralAgreementRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  CollateralAgreementRequest_Reject: {
    template: function () { return exports.CollateralAgreementRequest; },
    choiceName: 'CollateralAgreementRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.CollateralAgreementRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CollateralAgreementRequest_Reject_Result.encode(__typed__); },
  },
  CollateralAgreementRequest_Cancel: {
    template: function () { return exports.CollateralAgreementRequest; },
    choiceName: 'CollateralAgreementRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.CollateralAgreementRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreementRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CollateralAgreementRequest_Cancel_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CollateralAgreementRequest, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);



exports.CollateralAgreement_ProposeChange_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({collateralAgreementChangeRequestCid: damlTypes.ContractId(exports.CollateralAgreementChangeRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    collateralAgreementChangeRequestCid: damlTypes.ContractId(exports.CollateralAgreementChangeRequest).encode(__typed__.collateralAgreementChangeRequestCid),
  };
}
,
};



exports.CollateralAgreement_Terminate_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CollateralAgreement_TransferCollateral_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instructedCollateralCid: damlTypes.ContractId(exports.InstructedCollateral).decoder, }); }),
  encode: function (__typed__) {
  return {
    instructedCollateralCid: damlTypes.ContractId(exports.InstructedCollateral).encode(__typed__.instructedCollateralCid),
  };
}
,
};



exports.CollateralAgreement_Terminate = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).encode(__typed__.collateralStateCid),
  };
}
,
};



exports.CollateralAgreement_ProposeChange = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, updatedTerms: Utility_Collateral_App_Types.Terms.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    updatedTerms: Utility_Collateral_App_Types.Terms.encode(__typed__.updatedTerms),
  };
}
,
};



exports.CollateralAgreement_TransferCollateral = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, positions: damlTypes.List(Utility_Collateral_App_Types.InstrumentQuantity).decoder, reference: damlTypes.Text.decoder, createdAt: damlTypes.Time.decoder, allocateBefore: damlTypes.Time.decoder, settleBefore: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    positions: damlTypes.List(Utility_Collateral_App_Types.InstrumentQuantity).encode(__typed__.positions),
    reference: damlTypes.Text.encode(__typed__.reference),
    createdAt: damlTypes.Time.encode(__typed__.createdAt),
    allocateBefore: damlTypes.Time.encode(__typed__.allocateBefore),
    settleBefore: damlTypes.Time.encode(__typed__.settleBefore),
  };
}
,
};



exports.CollateralAgreement = damlTypes.assembleTemplate(
{
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:CollateralAgreement',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Model.Collateral:CollateralAgreement',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({partyA: damlTypes.Party.decoder, partyB: damlTypes.Party.decoder, operator: damlTypes.Party.decoder, id: damlTypes.Text.decoder, terms: Utility_Collateral_App_Types.Terms.decoder, }); }),
  encode: function (__typed__) {
  return {
    partyA: damlTypes.Party.encode(__typed__.partyA),
    partyB: damlTypes.Party.encode(__typed__.partyB),
    operator: damlTypes.Party.encode(__typed__.operator),
    id: damlTypes.Text.encode(__typed__.id),
    terms: Utility_Collateral_App_Types.Terms.encode(__typed__.terms),
  };
}
,
  CollateralAgreement_TransferCollateral: {
    template: function () { return exports.CollateralAgreement; },
    choiceName: 'CollateralAgreement_TransferCollateral',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreement_TransferCollateral.decoder; }),
    argumentEncode: function (__typed__) { return exports.CollateralAgreement_TransferCollateral.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreement_TransferCollateral_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CollateralAgreement_TransferCollateral_Result.encode(__typed__); },
  },
  CollateralAgreement_ProposeChange: {
    template: function () { return exports.CollateralAgreement; },
    choiceName: 'CollateralAgreement_ProposeChange',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreement_ProposeChange.decoder; }),
    argumentEncode: function (__typed__) { return exports.CollateralAgreement_ProposeChange.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreement_ProposeChange_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CollateralAgreement_ProposeChange_Result.encode(__typed__); },
  },
  CollateralAgreement_Terminate: {
    template: function () { return exports.CollateralAgreement; },
    choiceName: 'CollateralAgreement_Terminate',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreement_Terminate.decoder; }),
    argumentEncode: function (__typed__) { return exports.CollateralAgreement_Terminate.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CollateralAgreement_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CollateralAgreement_Terminate_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.CollateralAgreement; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CollateralAgreement, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);

