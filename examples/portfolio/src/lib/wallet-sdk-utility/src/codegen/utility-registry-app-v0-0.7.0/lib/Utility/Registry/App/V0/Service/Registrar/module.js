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

var pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 = require('@daml.js/utility-credential-v0-0.1.0');
var pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 = require('@daml.js/utility-registry-holding-v0-0.2.1');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab = require('@daml.js/utility-registry-v0-0.6.0');

var Utility_Registry_App_V0_Configuration_Provider = require('../../../../../../Utility/Registry/App/V0/Configuration/Provider/module');
var Utility_Registry_App_V0_Configuration_Registrar = require('../../../../../../Utility/Registry/App/V0/Configuration/Registrar/module');
var Utility_Registry_App_V0_Service_AllocationFactory = require('../../../../../../Utility/Registry/App/V0/Service/AllocationFactory/module');
var Utility_Registry_App_V0_Service_Enforcement = require('../../../../../../Utility/Registry/App/V0/Service/Enforcement/module');


exports.RegistrarService_ArchiveTransferRule_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarService_CreateTransferRule_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferRuleCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Rule.Transfer.TransferRule).decoder, }); }),
  encode: function (__typed__) {
  return {
    transferRuleCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Rule.Transfer.TransferRule).encode(__typed__.transferRuleCid),
  };
}
,
};



exports.RegistrarService_ArchiveAllocationFactory_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarService_CreateAllocationFactory_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({allocationFactoryCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_AllocationFactory.AllocationFactory).decoder, }); }),
  encode: function (__typed__) {
  return {
    allocationFactoryCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_AllocationFactory.AllocationFactory).encode(__typed__.allocationFactoryCid),
  };
}
,
};



exports.RejectedRegistrarServiceRequest_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarServiceRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarServiceRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedRegistrarServiceRequestCid: damlTypes.ContractId(exports.RejectedRegistrarServiceRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedRegistrarServiceRequestCid: damlTypes.ContractId(exports.RejectedRegistrarServiceRequest).encode(__typed__.rejectedRegistrarServiceRequestCid),
  };
}
,
};



exports.RegistrarServiceRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrarServiceCid: damlTypes.ContractId(exports.RegistrarService).decoder, transferRuleCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Rule.Transfer.TransferRule)).decoder), allocationFactoryCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Utility_Registry_App_V0_Service_AllocationFactory.AllocationFactory)).decoder), }); }),
  encode: function (__typed__) {
  return {
    registrarServiceCid: damlTypes.ContractId(exports.RegistrarService).encode(__typed__.registrarServiceCid),
    transferRuleCid: damlTypes.Optional(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Rule.Transfer.TransferRule)).encode(__typed__.transferRuleCid),
    allocationFactoryCid: damlTypes.Optional(damlTypes.ContractId(Utility_Registry_App_V0_Service_AllocationFactory.AllocationFactory)).encode(__typed__.allocationFactoryCid),
  };
}
,
};



exports.RejectedRegistrarServiceRequest_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedRegistrarServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Registrar:RejectedRegistrarServiceRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Registrar:RejectedRegistrarServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({request: exports.RegistrarServiceRequest.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    request: exports.RegistrarServiceRequest.encode(__typed__.request),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  Archive: {
    template: function () { return exports.RejectedRegistrarServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RejectedRegistrarServiceRequest_Delete: {
    template: function () { return exports.RejectedRegistrarServiceRequest; },
    choiceName: 'RejectedRegistrarServiceRequest_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedRegistrarServiceRequest_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedRegistrarServiceRequest_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedRegistrarServiceRequest_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedRegistrarServiceRequest_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedRegistrarServiceRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.RegistrarServiceRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarServiceRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.RegistrarServiceRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({providerConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, }); }),
  encode: function (__typed__) {
  return {
    providerConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).encode(__typed__.providerConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
  };
}
,
};



exports.RegistrarServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Registrar:RegistrarServiceRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Registrar:RegistrarServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, createTransferRule: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), createAllocationFactory: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    createTransferRule: damlTypes.Optional(damlTypes.Bool).encode(__typed__.createTransferRule),
    createAllocationFactory: damlTypes.Optional(damlTypes.Bool).encode(__typed__.createAllocationFactory),
  };
}
,
  RegistrarServiceRequest_Accept: {
    template: function () { return exports.RegistrarServiceRequest; },
    choiceName: 'RegistrarServiceRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarServiceRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarServiceRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarServiceRequest_Accept_Result.encode(__typed__); },
  },
  RegistrarServiceRequest_Reject: {
    template: function () { return exports.RegistrarServiceRequest; },
    choiceName: 'RegistrarServiceRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarServiceRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarServiceRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarServiceRequest_Reject_Result.encode(__typed__); },
  },
  RegistrarServiceRequest_Cancel: {
    template: function () { return exports.RegistrarServiceRequest; },
    choiceName: 'RegistrarServiceRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarServiceRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarServiceRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarServiceRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarServiceRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.RegistrarServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RegistrarServiceRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.RegistrarService_OfferBurn_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burnOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    burnOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer).encode(__typed__.burnOfferCid),
  };
}
,
};



exports.RegistrarService_OfferMint_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mintOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    mintOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer).encode(__typed__.mintOfferCid),
  };
}
,
};



exports.RegistrarService_ArchiveInstrumentConfiguration_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarService_ArchiveAndCreateInstrumentConfiguration_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({archiveResult: exports.RegistrarService_ArchiveInstrumentConfiguration_Result.decoder, createResult: exports.RegistrarService_CreateInstrumentConfiguration_Result.decoder, }); }),
  encode: function (__typed__) {
  return {
    archiveResult: exports.RegistrarService_ArchiveInstrumentConfiguration_Result.encode(__typed__.archiveResult),
    createResult: exports.RegistrarService_CreateInstrumentConfiguration_Result.encode(__typed__.createResult),
  };
}
,
};



exports.RegistrarService_ArchiveAndCreateRegistrarConfiguration_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({archiveResult: exports.RegistrarService_ArchiveRegistrarConfiguration_Result.decoder, createResult: exports.RegistrarService_CreateRegistrarConfiguration_Result.decoder, }); }),
  encode: function (__typed__) {
  return {
    archiveResult: exports.RegistrarService_ArchiveRegistrarConfiguration_Result.encode(__typed__.archiveResult),
    createResult: exports.RegistrarService_CreateRegistrarConfiguration_Result.encode(__typed__.createResult),
  };
}
,
};



exports.RegistrarService_ArchiveRegistrarConfiguration_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarService_CreateRegistrarConfiguration_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrarConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration).decoder, }); }),
  encode: function (__typed__) {
  return {
    registrarConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration).encode(__typed__.registrarConfigurationCid),
  };
}
,
};



exports.RegistrarService_CreateInstrumentConfiguration_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentConfigurationCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.Instrument.InstrumentConfiguration).decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentConfigurationCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.Instrument.InstrumentConfiguration).encode(__typed__.instrumentConfigurationCid),
  };
}
,
};



exports.RegistrarService_Terminate_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarService_ArchiveTransferRule = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Rule.Transfer.TransferRule).decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Rule.Transfer.TransferRule).encode(__typed__.cid),
  };
}
,
};



exports.RegistrarService_CreateTransferRule = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarService_ArchiveAllocationFactory = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({allocationFactoryCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_AllocationFactory.AllocationFactory).decoder, }); }),
  encode: function (__typed__) {
  return {
    allocationFactoryCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_AllocationFactory.AllocationFactory).encode(__typed__.allocationFactoryCid),
  };
}
,
};



exports.RegistrarService_CreateAllocationFactory = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarService_DeleteExecutedTransfers = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cids: damlTypes.List(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer)).decoder, choiceObservers: damlTypes.List(damlTypes.Party).decoder, actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    cids: damlTypes.List(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer)).encode(__typed__.cids),
    choiceObservers: damlTypes.List(damlTypes.Party).encode(__typed__.choiceObservers),
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RegistrarService_DeleteExecutedTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteFailedTransfers = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cids: damlTypes.List(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer)).decoder, choiceObservers: damlTypes.List(damlTypes.Party).decoder, actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    cids: damlTypes.List(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer)).encode(__typed__.cids),
    choiceObservers: damlTypes.List(damlTypes.Party).encode(__typed__.choiceObservers),
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RegistrarService_DeleteFailedTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteRejectedTransfers = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cids: damlTypes.List(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer)).decoder, choiceObservers: damlTypes.List(damlTypes.Party).decoder, actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    cids: damlTypes.List(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer)).encode(__typed__.cids),
    choiceObservers: damlTypes.List(damlTypes.Party).encode(__typed__.choiceObservers),
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RegistrarService_DeleteRejectedTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteExecutedUnlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.ExecutedUnlock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.ExecutedUnlock_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.ExecutedUnlock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.ExecutedUnlock_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteFailedUnlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.FailedUnlock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.FailedUnlock_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.FailedUnlock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.FailedUnlock_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteRejectedUnlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.RejectedUnlock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.RejectedUnlock_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.RejectedUnlock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.RejectedUnlock_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteExecutedLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.ExecutedLock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.ExecutedLock_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.ExecutedLock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.ExecutedLock_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteFailedLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.FailedLock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.FailedLock_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.FailedLock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.FailedLock_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteRejectedLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.RejectedLock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.RejectedLock_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.RejectedLock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.RejectedLock_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteExecutedBurn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.ExecutedBurn).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.ExecutedBurn_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.ExecutedBurn).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.ExecutedBurn_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteFailedBurn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.FailedBurn).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.FailedBurn_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.FailedBurn).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.FailedBurn_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteRejectedBurn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.RejectedBurn).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.RejectedBurn_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.RejectedBurn).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.RejectedBurn_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteExecutedMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.ExecutedMint).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.ExecutedMint_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.ExecutedMint).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.ExecutedMint_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteFailedMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.FailedMint).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.FailedMint_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.FailedMint).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.FailedMint_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_DeleteRejectedMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.RejectedMint).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.RejectedMint_Delete.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.RejectedMint).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.RejectedMint_Delete.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_FailAcceptedBurn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Fail.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Fail.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_ExecuteAcceptedBurn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Execute.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Execute.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_FailAcceptedMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Fail.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Fail.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_ExecuteAcceptedMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Execute.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Execute.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_FailAcceptedUnlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Fail.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Fail.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_ExecuteAcceptedUnlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Execute.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Execute.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_FailAcceptedLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Fail.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Fail.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_ExecuteAcceptedLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Execute.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Execute.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_FailAcceptedTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Fail.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Fail.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_ExecuteAcceptedTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Execute.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Execute.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_MergeHolding = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, payload: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Merge.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.cid),
    payload: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Merge.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_SplitHolding = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, payload: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Split.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.cid),
    payload: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Split.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_RejectBurnRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_AcceptBurnRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_CancelBurnOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_OfferBurn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, holder: damlTypes.Party.decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    holder: damlTypes.Party.encode(__typed__.holder),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
  };
}
,
};



exports.RegistrarService_RejectMintRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_AcceptMintRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_CancelMintOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_OfferMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, holder: damlTypes.Party.decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    holder: damlTypes.Party.encode(__typed__.holder),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
  };
}
,
};



exports.RegistrarService_ArchiveAndCreateInstrumentConfiguration = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.Instrument.InstrumentConfiguration).decoder, payload: exports.RegistrarService_CreateInstrumentConfiguration.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.Instrument.InstrumentConfiguration).encode(__typed__.cid),
    payload: exports.RegistrarService_CreateInstrumentConfiguration.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_ArchiveInstrumentConfiguration = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.Instrument.InstrumentConfiguration).decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.Instrument.InstrumentConfiguration).encode(__typed__.cid),
  };
}
,
};



exports.RegistrarService_CreateInstrumentConfiguration = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentId: damlTypes.Text.decoder, additionalIdentifiers: damlTypes.List(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier).decoder, issuerRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, holderRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentId: damlTypes.Text.encode(__typed__.instrumentId),
    additionalIdentifiers: damlTypes.List(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier).encode(__typed__.additionalIdentifiers),
    issuerRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.issuerRequirements),
    holderRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.holderRequirements),
  };
}
,
};



exports.RegistrarService_ArchiveAndCreateRegistrarConfiguration = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration).decoder, payload: exports.RegistrarService_CreateRegistrarConfiguration.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration).encode(__typed__.cid),
    payload: exports.RegistrarService_CreateRegistrarConfiguration.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_ArchiveRegistrarConfiguration = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration).decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration).encode(__typed__.cid),
  };
}
,
};



exports.RegistrarService_RejectForceTransferRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_FailAcceptedForceTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Fail.decoder, actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Fail.encode(__typed__.payload),
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RegistrarService_ExecuteAcceptedForceTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Execute.decoder, actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Execute.encode(__typed__.payload),
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RegistrarService_AcceptForceTransferRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({senderEnforcementServiceCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementService).decoder, receiverEnforcementServiceCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementService).decoder, cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    senderEnforcementServiceCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementService).encode(__typed__.senderEnforcementServiceCid),
    receiverEnforcementServiceCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementService).encode(__typed__.receiverEnforcementServiceCid),
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_CreateRegistrarConfiguration = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({enforcementRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, }); }),
  encode: function (__typed__) {
  return {
    enforcementRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.enforcementRequirements),
  };
}
,
};



exports.RegistrarService_TerminateEnforcementService = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementService).decoder, payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementService_Terminate.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementService).encode(__typed__.cid),
    payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementService_Terminate.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_RejectEnforcementServiceRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest).decoder, payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest).encode(__typed__.cid),
    payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_AcceptEnforcementServiceRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest).decoder, payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest).encode(__typed__.cid),
    payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.RegistrarService_Terminate = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RegistrarService_Set = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({enableResultContracts: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    enableResultContracts: damlTypes.Optional(damlTypes.Bool).encode(__typed__.enableResultContracts),
  };
}
,
};



exports.RegistrarService = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Registrar:RegistrarService',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Registrar:RegistrarService',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, enableResultContracts: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    enableResultContracts: damlTypes.Optional(damlTypes.Bool).encode(__typed__.enableResultContracts),
  };
}
,
  RegistrarService_Set: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_Set',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_Set.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_Set.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.RegistrarService).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.RegistrarService).encode(__typed__); },
  },
  RegistrarService_Terminate: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_Terminate',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_Terminate.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_Terminate.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_Terminate_Result.encode(__typed__); },
  },
  RegistrarService_AcceptEnforcementServiceRequest: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_AcceptEnforcementServiceRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_AcceptEnforcementServiceRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_AcceptEnforcementServiceRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Accept_Result.encode(__typed__); },
  },
  RegistrarService_RejectEnforcementServiceRequest: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_RejectEnforcementServiceRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_RejectEnforcementServiceRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_RejectEnforcementServiceRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Reject_Result.encode(__typed__); },
  },
  RegistrarService_TerminateEnforcementService: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_TerminateEnforcementService',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_TerminateEnforcementService.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_TerminateEnforcementService.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Registry_App_V0_Service_Enforcement.EnforcementService_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Registry_App_V0_Service_Enforcement.EnforcementService_Terminate_Result.encode(__typed__); },
  },
  RegistrarService_CreateRegistrarConfiguration: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_CreateRegistrarConfiguration',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CreateRegistrarConfiguration.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_CreateRegistrarConfiguration.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CreateRegistrarConfiguration_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_CreateRegistrarConfiguration_Result.encode(__typed__); },
  },
  RegistrarService_AcceptForceTransferRequest: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_AcceptForceTransferRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_AcceptForceTransferRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_AcceptForceTransferRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept_Result.encode(__typed__); },
  },
  RegistrarService_ExecuteAcceptedForceTransfer: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ExecuteAcceptedForceTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ExecuteAcceptedForceTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ExecuteAcceptedForceTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Execute_Result.encode(__typed__); },
  },
  RegistrarService_FailAcceptedForceTransfer: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_FailAcceptedForceTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_FailAcceptedForceTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_FailAcceptedForceTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Fail_Result.encode(__typed__); },
  },
  RegistrarService_RejectForceTransferRequest: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_RejectForceTransferRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_RejectForceTransferRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_RejectForceTransferRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Reject_Result.encode(__typed__); },
  },
  RegistrarService_ArchiveRegistrarConfiguration: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ArchiveRegistrarConfiguration',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveRegistrarConfiguration.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ArchiveRegistrarConfiguration.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveRegistrarConfiguration_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_ArchiveRegistrarConfiguration_Result.encode(__typed__); },
  },
  RegistrarService_ArchiveAndCreateRegistrarConfiguration: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ArchiveAndCreateRegistrarConfiguration',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveAndCreateRegistrarConfiguration.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ArchiveAndCreateRegistrarConfiguration.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveAndCreateRegistrarConfiguration_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_ArchiveAndCreateRegistrarConfiguration_Result.encode(__typed__); },
  },
  RegistrarService_CreateInstrumentConfiguration: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_CreateInstrumentConfiguration',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CreateInstrumentConfiguration.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_CreateInstrumentConfiguration.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CreateInstrumentConfiguration_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_CreateInstrumentConfiguration_Result.encode(__typed__); },
  },
  RegistrarService_ArchiveInstrumentConfiguration: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ArchiveInstrumentConfiguration',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveInstrumentConfiguration.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ArchiveInstrumentConfiguration.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveInstrumentConfiguration_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_ArchiveInstrumentConfiguration_Result.encode(__typed__); },
  },
  RegistrarService_ArchiveAndCreateInstrumentConfiguration: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ArchiveAndCreateInstrumentConfiguration',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveAndCreateInstrumentConfiguration.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ArchiveAndCreateInstrumentConfiguration.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveAndCreateInstrumentConfiguration_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_ArchiveAndCreateInstrumentConfiguration_Result.encode(__typed__); },
  },
  RegistrarService_OfferMint: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_OfferMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_OfferMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_OfferMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_OfferMint_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_OfferMint_Result.encode(__typed__); },
  },
  RegistrarService_CancelMintOffer: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_CancelMintOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CancelMintOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_CancelMintOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Cancel_Result.encode(__typed__); },
  },
  RegistrarService_AcceptMintRequest: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_AcceptMintRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_AcceptMintRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_AcceptMintRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Accept_Result.encode(__typed__); },
  },
  RegistrarService_RejectMintRequest: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_RejectMintRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_RejectMintRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_RejectMintRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Reject_Result.encode(__typed__); },
  },
  RegistrarService_OfferBurn: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_OfferBurn',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_OfferBurn.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_OfferBurn.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_OfferBurn_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_OfferBurn_Result.encode(__typed__); },
  },
  RegistrarService_CancelBurnOffer: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_CancelBurnOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CancelBurnOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_CancelBurnOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Cancel_Result.encode(__typed__); },
  },
  RegistrarService_AcceptBurnRequest: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_AcceptBurnRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_AcceptBurnRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_AcceptBurnRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Accept_Result.encode(__typed__); },
  },
  RegistrarService_RejectBurnRequest: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_RejectBurnRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_RejectBurnRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_RejectBurnRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Reject_Result.encode(__typed__); },
  },
  RegistrarService_SplitHolding: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_SplitHolding',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_SplitHolding.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_SplitHolding.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Split_Result.decoder; }),
    resultEncode: function (__typed__) { return pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Split_Result.encode(__typed__); },
  },
  RegistrarService_MergeHolding: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_MergeHolding',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_MergeHolding.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_MergeHolding.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Merge_Result.decoder; }),
    resultEncode: function (__typed__) { return pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Merge_Result.encode(__typed__); },
  },
  RegistrarService_ExecuteAcceptedTransfer: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ExecuteAcceptedTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ExecuteAcceptedTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ExecuteAcceptedTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Execute_Result.encode(__typed__); },
  },
  RegistrarService_FailAcceptedTransfer: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_FailAcceptedTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_FailAcceptedTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_FailAcceptedTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Fail_Result.encode(__typed__); },
  },
  RegistrarService_ExecuteAcceptedLock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ExecuteAcceptedLock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ExecuteAcceptedLock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ExecuteAcceptedLock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Execute_Result.encode(__typed__); },
  },
  RegistrarService_FailAcceptedLock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_FailAcceptedLock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_FailAcceptedLock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_FailAcceptedLock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Fail_Result.encode(__typed__); },
  },
  RegistrarService_ExecuteAcceptedUnlock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ExecuteAcceptedUnlock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ExecuteAcceptedUnlock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ExecuteAcceptedUnlock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Execute_Result.encode(__typed__); },
  },
  RegistrarService_FailAcceptedUnlock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_FailAcceptedUnlock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_FailAcceptedUnlock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_FailAcceptedUnlock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Fail_Result.encode(__typed__); },
  },
  RegistrarService_ExecuteAcceptedMint: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ExecuteAcceptedMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ExecuteAcceptedMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ExecuteAcceptedMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Execute_Result.encode(__typed__); },
  },
  RegistrarService_FailAcceptedMint: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_FailAcceptedMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_FailAcceptedMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_FailAcceptedMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Fail_Result.encode(__typed__); },
  },
  RegistrarService_ExecuteAcceptedBurn: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ExecuteAcceptedBurn',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ExecuteAcceptedBurn.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ExecuteAcceptedBurn.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Execute_Result.encode(__typed__); },
  },
  RegistrarService_FailAcceptedBurn: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_FailAcceptedBurn',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_FailAcceptedBurn.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_FailAcceptedBurn.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Fail_Result.encode(__typed__); },
  },
  RegistrarService_DeleteRejectedMint: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteRejectedMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteRejectedMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteRejectedMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.RejectedMint_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.RejectedMint_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteFailedMint: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteFailedMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteFailedMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteFailedMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.FailedMint_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.FailedMint_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteExecutedMint: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteExecutedMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteExecutedMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteExecutedMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.ExecutedMint_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.ExecutedMint_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteRejectedBurn: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteRejectedBurn',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteRejectedBurn.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteRejectedBurn.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.RejectedBurn_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.RejectedBurn_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteFailedBurn: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteFailedBurn',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteFailedBurn.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteFailedBurn.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.FailedBurn_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.FailedBurn_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteExecutedBurn: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteExecutedBurn',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteExecutedBurn.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteExecutedBurn.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.ExecutedBurn_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.ExecutedBurn_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteRejectedLock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteRejectedLock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteRejectedLock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteRejectedLock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.RejectedLock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.RejectedLock_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteFailedLock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteFailedLock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteFailedLock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteFailedLock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.FailedLock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.FailedLock_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteExecutedLock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteExecutedLock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteExecutedLock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteExecutedLock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.ExecutedLock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.ExecutedLock_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteRejectedUnlock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteRejectedUnlock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteRejectedUnlock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteRejectedUnlock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.RejectedUnlock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.RejectedUnlock_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteFailedUnlock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteFailedUnlock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteFailedUnlock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteFailedUnlock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.FailedUnlock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.FailedUnlock_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteExecutedUnlock: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteExecutedUnlock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteExecutedUnlock.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteExecutedUnlock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.ExecutedUnlock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.ExecutedUnlock_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteRejectedTransfer: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteRejectedTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteRejectedTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteRejectedTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteRejectedTransfers: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteRejectedTransfers',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteRejectedTransfers.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteRejectedTransfers.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RegistrarService_DeleteFailedTransfer: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteFailedTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteFailedTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteFailedTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteFailedTransfers: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteFailedTransfers',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteFailedTransfers.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteFailedTransfers.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RegistrarService_DeleteExecutedTransfer: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteExecutedTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteExecutedTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteExecutedTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer_Delete_Result.encode(__typed__); },
  },
  RegistrarService_DeleteExecutedTransfers: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_DeleteExecutedTransfers',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_DeleteExecutedTransfers.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_DeleteExecutedTransfers.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RegistrarService_CreateAllocationFactory: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_CreateAllocationFactory',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CreateAllocationFactory.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_CreateAllocationFactory.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CreateAllocationFactory_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_CreateAllocationFactory_Result.encode(__typed__); },
  },
  RegistrarService_ArchiveAllocationFactory: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ArchiveAllocationFactory',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveAllocationFactory.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ArchiveAllocationFactory.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveAllocationFactory_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_ArchiveAllocationFactory_Result.encode(__typed__); },
  },
  RegistrarService_CreateTransferRule: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_CreateTransferRule',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CreateTransferRule.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_CreateTransferRule.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_CreateTransferRule_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_CreateTransferRule_Result.encode(__typed__); },
  },
  RegistrarService_ArchiveTransferRule: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'RegistrarService_ArchiveTransferRule',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveTransferRule.decoder; }),
    argumentEncode: function (__typed__) { return exports.RegistrarService_ArchiveTransferRule.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RegistrarService_ArchiveTransferRule_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RegistrarService_ArchiveTransferRule_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.RegistrarService; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RegistrarService, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);

