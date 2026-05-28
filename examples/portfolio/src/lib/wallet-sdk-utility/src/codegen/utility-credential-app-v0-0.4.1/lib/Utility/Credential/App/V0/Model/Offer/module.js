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
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 = require('@daml.js/splice-amulet-0.1.16');

var Utility_Credential_App_V0_Model_Billing = require('../../../../../../Utility/Credential/App/V0/Model/Billing/module');
var Utility_Credential_App_V0_Types = require('../../../../../../Utility/Credential/App/V0/Types/module');


exports.RejectedCredentialOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Offer:RejectedCredentialOffer',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Model.Offer:RejectedCredentialOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({offer: exports.CredentialOffer.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    offer: exports.CredentialOffer.encode(__typed__.offer),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  Archive: {
    template: function () { return exports.RejectedCredentialOffer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedCredentialOffer, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);



exports.CredentialOffer_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedCredentialOfferCid: damlTypes.ContractId(exports.RejectedCredentialOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedCredentialOfferCid: damlTypes.ContractId(exports.RejectedCredentialOffer).encode(__typed__.rejectedCredentialOfferCid),
  };
}
,
};



exports.CredentialOffer_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CredentialOffer_AcceptPaid_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, credentialCid: damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
    credentialCid: damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential).encode(__typed__.credentialCid),
  };
}
,
};



exports.CredentialOffer_AcceptFree_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialCid: damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialCid: damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential).encode(__typed__.credentialCid),
  };
}
,
};



exports.CredentialOffer_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.CredentialOffer_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CredentialOffer_AcceptPaid = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holderInputs: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    holderInputs: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.holderInputs),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.CredentialOffer_AcceptFree = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CredentialOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Offer:CredentialOffer',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Model.Offer:CredentialOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, issuer: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, dso: damlTypes.Party.decoder, id: damlTypes.Text.decoder, description: damlTypes.Text.decoder, claims: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Claim).decoder, billingParams: jtv.Decoder.withDefault(null, damlTypes.Optional(Utility_Credential_App_V0_Types.BillingParams).decoder), depositInitialAmountUsd: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    issuer: damlTypes.Party.encode(__typed__.issuer),
    holder: damlTypes.Party.encode(__typed__.holder),
    dso: damlTypes.Party.encode(__typed__.dso),
    id: damlTypes.Text.encode(__typed__.id),
    description: damlTypes.Text.encode(__typed__.description),
    claims: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Claim).encode(__typed__.claims),
    billingParams: damlTypes.Optional(Utility_Credential_App_V0_Types.BillingParams).encode(__typed__.billingParams),
    depositInitialAmountUsd: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.depositInitialAmountUsd),
  };
}
,
  Archive: {
    template: function () { return exports.CredentialOffer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  CredentialOffer_AcceptFree: {
    template: function () { return exports.CredentialOffer; },
    choiceName: 'CredentialOffer_AcceptFree',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialOffer_AcceptFree.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialOffer_AcceptFree.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialOffer_AcceptFree_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialOffer_AcceptFree_Result.encode(__typed__); },
  },
  CredentialOffer_AcceptPaid: {
    template: function () { return exports.CredentialOffer; },
    choiceName: 'CredentialOffer_AcceptPaid',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialOffer_AcceptPaid.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialOffer_AcceptPaid.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialOffer_AcceptPaid_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialOffer_AcceptPaid_Result.encode(__typed__); },
  },
  CredentialOffer_Cancel: {
    template: function () { return exports.CredentialOffer; },
    choiceName: 'CredentialOffer_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialOffer_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialOffer_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialOffer_Cancel_Result.encode(__typed__); },
  },
  CredentialOffer_Reject: {
    template: function () { return exports.CredentialOffer; },
    choiceName: 'CredentialOffer_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialOffer_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialOffer_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialOffer_Reject_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CredentialOffer, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);

