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
var pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 = require('@daml.js/utility-credential-v0-0.1.0');
var pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193 = require('@daml.js/splice-api-token-allocation-request-v1-1.0.0');
var pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b = require('@daml.js/splice-api-token-holding-v1-1.0.0');
var pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 = require('@daml.js/utility-registry-holding-v0-0.2.1');
var pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d = require('@daml.js/splice-api-token-allocation-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab = require('@daml.js/utility-registry-v0-0.6.0');

var Utility_Registry_App_V0_Configuration_Provider = require('../../../../../../Utility/Registry/App/V0/Configuration/Provider/module');
var Utility_Registry_App_V0_Service_Enforcement = require('../../../../../../Utility/Registry/App/V0/Service/Enforcement/module');


exports.RejectedHolderServiceRequest_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.HolderServiceRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.HolderServiceRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedHolderServiceRequestCid: damlTypes.ContractId(exports.RejectedHolderServiceRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedHolderServiceRequestCid: damlTypes.ContractId(exports.RejectedHolderServiceRequest).encode(__typed__.rejectedHolderServiceRequestCid),
  };
}
,
};



exports.HolderServiceRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holderServiceCid: damlTypes.ContractId(exports.HolderService).decoder, }); }),
  encode: function (__typed__) {
  return {
    holderServiceCid: damlTypes.ContractId(exports.HolderService).encode(__typed__.holderServiceCid),
  };
}
,
};



exports.RejectedHolderServiceRequest_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedHolderServiceRequest_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RejectedHolderServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Holder:RejectedHolderServiceRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Holder:RejectedHolderServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({request: exports.HolderServiceRequest.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    request: exports.HolderServiceRequest.encode(__typed__.request),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  RejectedHolderServiceRequest_Clean: {
    template: function () { return exports.RejectedHolderServiceRequest; },
    choiceName: 'RejectedHolderServiceRequest_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedHolderServiceRequest_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedHolderServiceRequest_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.RejectedHolderServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RejectedHolderServiceRequest_Delete: {
    template: function () { return exports.RejectedHolderServiceRequest; },
    choiceName: 'RejectedHolderServiceRequest_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedHolderServiceRequest_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedHolderServiceRequest_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedHolderServiceRequest_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedHolderServiceRequest_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedHolderServiceRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.HolderServiceRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.HolderServiceRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.HolderServiceRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({providerConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, }); }),
  encode: function (__typed__) {
  return {
    providerConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).encode(__typed__.providerConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
  };
}
,
};



exports.HolderServiceRequest_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.HolderServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Holder:HolderServiceRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Holder:HolderServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    holder: damlTypes.Party.encode(__typed__.holder),
  };
}
,
  HolderServiceRequest_Clean: {
    template: function () { return exports.HolderServiceRequest; },
    choiceName: 'HolderServiceRequest_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderServiceRequest_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderServiceRequest_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  HolderServiceRequest_Accept: {
    template: function () { return exports.HolderServiceRequest; },
    choiceName: 'HolderServiceRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderServiceRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderServiceRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderServiceRequest_Accept_Result.encode(__typed__); },
  },
  HolderServiceRequest_Reject: {
    template: function () { return exports.HolderServiceRequest; },
    choiceName: 'HolderServiceRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderServiceRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderServiceRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderServiceRequest_Reject_Result.encode(__typed__); },
  },
  HolderServiceRequest_Cancel: {
    template: function () { return exports.HolderServiceRequest; },
    choiceName: 'HolderServiceRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderServiceRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderServiceRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderServiceRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderServiceRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.HolderServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.HolderServiceRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.HolderService_RequestUnlock_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unlockRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    unlockRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest).encode(__typed__.unlockRequestCid),
  };
}
,
};



exports.HolderService_OfferUnlock_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unlockOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    unlockOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer).encode(__typed__.unlockOfferCid),
  };
}
,
};



exports.HolderService_RequestLock_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lockRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    lockRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest).encode(__typed__.lockRequestCid),
  };
}
,
};



exports.HolderService_OfferLock_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lockOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    lockOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer).encode(__typed__.lockOfferCid),
  };
}
,
};



exports.HolderService_RequestTransfer_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    transferRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest).encode(__typed__.transferRequestCid),
  };
}
,
};



exports.HolderService_AcceptTransferOffer_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedTransferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedTransferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer).encode(__typed__.acceptedTransferCid),
  };
}
,
};



exports.HolderService_OfferTransfer_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    transferOfferCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer).encode(__typed__.transferOfferCid),
  };
}
,
};



exports.HolderService_RequestBurn_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burnRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    burnRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest).encode(__typed__.burnRequestCid),
  };
}
,
};



exports.HolderService_RequestMint_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mintRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    mintRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest).encode(__typed__.mintRequestCid),
  };
}
,
};



exports.HolderService_RequestForceTransfer_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({forceTransferRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    forceTransferRequestCid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).encode(__typed__.forceTransferRequestCid),
  };
}
,
};



exports.HolderService_RequestEnforcementService_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({enforcementServiceRequestCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    enforcementServiceRequestCid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest).encode(__typed__.enforcementServiceRequestCid),
  };
}
,
};



exports.HolderService_Terminate_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.HolderService_RejectAllocationRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({allocationRequestCid: damlTypes.ContractId(pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    allocationRequestCid: damlTypes.ContractId(pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest).encode(__typed__.allocationRequestCid),
  };
}
,
};



exports.HolderService_CreateAllocation = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, allocationFactoryCid: damlTypes.ContractId(pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory).decoder, allocation: pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.AllocationSpecification.decoder, inputHoldings: damlTypes.List(damlTypes.ContractId(pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding)).decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
    allocationFactoryCid: damlTypes.ContractId(pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory).encode(__typed__.allocationFactoryCid),
    allocation: pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.AllocationSpecification.encode(__typed__.allocation),
    inputHoldings: damlTypes.List(damlTypes.ContractId(pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding)).encode(__typed__.inputHoldings),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};



exports.HolderService_RejectUnlockRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_AcceptUnlockRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_CancelUnlockRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_RequestUnlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, lockContext: damlTypes.Text.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, holdingLabel: damlTypes.Text.decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
    holder: damlTypes.Party.encode(__typed__.holder),
    lockContext: damlTypes.Text.encode(__typed__.lockContext),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
  };
}
,
};



exports.HolderService_RejectUnlockOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Reject.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_AcceptUnlockOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Accept.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_CancelUnlockOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_OfferUnlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, locker: damlTypes.Party.decoder, lockContext: damlTypes.Text.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, holdingLabel: damlTypes.Text.decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
    locker: damlTypes.Party.encode(__typed__.locker),
    lockContext: damlTypes.Text.encode(__typed__.lockContext),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
  };
}
,
};



exports.HolderService_RejectLockRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_AcceptLockRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_CancelLockRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_RequestLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, context: damlTypes.Text.decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
    holder: damlTypes.Party.encode(__typed__.holder),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    context: damlTypes.Text.encode(__typed__.context),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
  };
}
,
};



exports.HolderService_RejectLockOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Reject.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_AcceptLockOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Accept.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_CancelLockOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_OfferLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, locker: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, context: damlTypes.Text.decoder, holdingLabel: damlTypes.Text.decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
    locker: damlTypes.Party.encode(__typed__.locker),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    context: damlTypes.Text.encode(__typed__.context),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
  };
}
,
};



exports.HolderService_RejectTransferRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_AcceptTransferRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_CancelTransferRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_RequestTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, sender: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, receiverLabel: damlTypes.Text.decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
    sender: damlTypes.Party.encode(__typed__.sender),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    receiverLabel: damlTypes.Text.encode(__typed__.receiverLabel),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
  };
}
,
};



exports.HolderService_RejectTransferOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Reject.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_AcceptTransferOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Accept.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_CancelTransferOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_OfferTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, receiver: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, senderLabel: damlTypes.Text.decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    senderLabel: damlTypes.Text.encode(__typed__.senderLabel),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
  };
}
,
};



exports.HolderService_RejectBurnOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Reject.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_AcceptBurnOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Accept.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_CancelBurnRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_RequestBurn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, holdingLabel: damlTypes.Text.decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
  };
}
,
};



exports.HolderService_RejectMintOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Reject.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_AcceptMintOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Accept.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_CancelMintRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_RequestMint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
};



exports.HolderService_CancelForceTransferRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_RequestForceTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({requestorRationale: damlTypes.Text.decoder, registrar: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, reference: damlTypes.Text.decoder, batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.decoder, sender: damlTypes.Party.decoder, senderLabel: damlTypes.Text.decoder, receiver: damlTypes.Party.decoder, receiverLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    requestorRationale: damlTypes.Text.encode(__typed__.requestorRationale),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch.encode(__typed__.batch),
    sender: damlTypes.Party.encode(__typed__.sender),
    senderLabel: damlTypes.Text.encode(__typed__.senderLabel),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    receiverLabel: damlTypes.Text.encode(__typed__.receiverLabel),
  };
}
,
};



exports.HolderService_CancelEnforcementServiceRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest).decoder, payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest).encode(__typed__.cid),
    payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.HolderService_RequestEnforcementService = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrar: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrar: damlTypes.Party.encode(__typed__.registrar),
  };
}
,
};



exports.HolderService_Terminate = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.HolderService_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.HolderService = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Holder:HolderService',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Holder:HolderService',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    holder: damlTypes.Party.encode(__typed__.holder),
  };
}
,
  HolderService_Clean: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  HolderService_Terminate: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_Terminate',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_Terminate.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_Terminate.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_Terminate_Result.encode(__typed__); },
  },
  HolderService_RequestEnforcementService: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RequestEnforcementService',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestEnforcementService.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RequestEnforcementService.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestEnforcementService_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_RequestEnforcementService_Result.encode(__typed__); },
  },
  HolderService_CancelEnforcementServiceRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelEnforcementServiceRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelEnforcementServiceRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelEnforcementServiceRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Cancel_Result.encode(__typed__); },
  },
  HolderService_RequestForceTransfer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RequestForceTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestForceTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RequestForceTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestForceTransfer_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_RequestForceTransfer_Result.encode(__typed__); },
  },
  HolderService_CancelForceTransferRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelForceTransferRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelForceTransferRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelForceTransferRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Cancel_Result.encode(__typed__); },
  },
  HolderService_RequestMint: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RequestMint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestMint.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RequestMint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestMint_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_RequestMint_Result.encode(__typed__); },
  },
  HolderService_CancelMintRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelMintRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelMintRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelMintRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Cancel_Result.encode(__typed__); },
  },
  HolderService_AcceptMintOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_AcceptMintOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_AcceptMintOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_AcceptMintOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Accept_Result.encode(__typed__); },
  },
  HolderService_RejectMintOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RejectMintOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RejectMintOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RejectMintOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Reject_Result.encode(__typed__); },
  },
  HolderService_RequestBurn: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RequestBurn',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestBurn.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RequestBurn.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestBurn_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_RequestBurn_Result.encode(__typed__); },
  },
  HolderService_CancelBurnRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelBurnRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelBurnRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelBurnRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Cancel_Result.encode(__typed__); },
  },
  HolderService_AcceptBurnOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_AcceptBurnOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_AcceptBurnOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_AcceptBurnOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Accept_Result.encode(__typed__); },
  },
  HolderService_RejectBurnOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RejectBurnOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RejectBurnOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RejectBurnOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Reject_Result.encode(__typed__); },
  },
  HolderService_OfferTransfer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_OfferTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_OfferTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_OfferTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_OfferTransfer_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_OfferTransfer_Result.encode(__typed__); },
  },
  HolderService_CancelTransferOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelTransferOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelTransferOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelTransferOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Cancel_Result.encode(__typed__); },
  },
  HolderService_AcceptTransferOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_AcceptTransferOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_AcceptTransferOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_AcceptTransferOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Accept_Result.encode(__typed__); },
  },
  HolderService_RejectTransferOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RejectTransferOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RejectTransferOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RejectTransferOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Reject_Result.encode(__typed__); },
  },
  HolderService_RequestTransfer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RequestTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RequestTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestTransfer_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_RequestTransfer_Result.encode(__typed__); },
  },
  HolderService_CancelTransferRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelTransferRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelTransferRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelTransferRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Cancel_Result.encode(__typed__); },
  },
  HolderService_AcceptTransferRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_AcceptTransferRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_AcceptTransferRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_AcceptTransferRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Accept_Result.encode(__typed__); },
  },
  HolderService_RejectTransferRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RejectTransferRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RejectTransferRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RejectTransferRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Reject_Result.encode(__typed__); },
  },
  HolderService_OfferLock: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_OfferLock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_OfferLock.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_OfferLock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_OfferLock_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_OfferLock_Result.encode(__typed__); },
  },
  HolderService_CancelLockOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelLockOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelLockOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelLockOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Cancel_Result.encode(__typed__); },
  },
  HolderService_AcceptLockOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_AcceptLockOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_AcceptLockOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_AcceptLockOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Accept_Result.encode(__typed__); },
  },
  HolderService_RejectLockOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RejectLockOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RejectLockOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RejectLockOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Reject_Result.encode(__typed__); },
  },
  HolderService_RequestLock: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RequestLock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestLock.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RequestLock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestLock_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_RequestLock_Result.encode(__typed__); },
  },
  HolderService_CancelLockRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelLockRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelLockRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelLockRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Cancel_Result.encode(__typed__); },
  },
  HolderService_AcceptLockRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_AcceptLockRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_AcceptLockRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_AcceptLockRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Accept_Result.encode(__typed__); },
  },
  HolderService_RejectLockRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RejectLockRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RejectLockRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RejectLockRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Reject_Result.encode(__typed__); },
  },
  HolderService_OfferUnlock: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_OfferUnlock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_OfferUnlock.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_OfferUnlock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_OfferUnlock_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_OfferUnlock_Result.encode(__typed__); },
  },
  HolderService_CancelUnlockOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelUnlockOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelUnlockOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelUnlockOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Cancel_Result.encode(__typed__); },
  },
  HolderService_AcceptUnlockOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_AcceptUnlockOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_AcceptUnlockOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_AcceptUnlockOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Accept_Result.encode(__typed__); },
  },
  HolderService_RejectUnlockOffer: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RejectUnlockOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RejectUnlockOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RejectUnlockOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Reject_Result.encode(__typed__); },
  },
  HolderService_RequestUnlock: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RequestUnlock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestUnlock.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RequestUnlock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RequestUnlock_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.HolderService_RequestUnlock_Result.encode(__typed__); },
  },
  HolderService_CancelUnlockRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CancelUnlockRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CancelUnlockRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CancelUnlockRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Cancel_Result.encode(__typed__); },
  },
  HolderService_AcceptUnlockRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_AcceptUnlockRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_AcceptUnlockRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_AcceptUnlockRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Accept_Result.encode(__typed__); },
  },
  HolderService_RejectUnlockRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RejectUnlockRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RejectUnlockRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RejectUnlockRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Reject_Result.encode(__typed__); },
  },
  HolderService_CreateAllocation: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_CreateAllocation',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_CreateAllocation.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_CreateAllocation.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationInstructionResult.decoder; }),
    resultEncode: function (__typed__) { return pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationInstructionResult.encode(__typed__); },
  },
  HolderService_RejectAllocationRequest: {
    template: function () { return exports.HolderService; },
    choiceName: 'HolderService_RejectAllocationRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.HolderService_RejectAllocationRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.HolderService_RejectAllocationRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ChoiceExecutionMetadata.decoder; }),
    resultEncode: function (__typed__) { return pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ChoiceExecutionMetadata.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.HolderService; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.HolderService, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);

