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
var Utility_Credential_App_V0_Model_Offer = require('../../../../../../Utility/Credential/App/V0/Model/Offer/module');
var Utility_Credential_App_V0_Types = require('../../../../../../Utility/Credential/App/V0/Types/module');


exports.UserServiceRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserServiceRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserServiceRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({userServiceCid: damlTypes.ContractId(exports.UserService).decoder, }); }),
  encode: function (__typed__) {
  return {
    userServiceCid: damlTypes.ContractId(exports.UserService).encode(__typed__.userServiceCid),
  };
}
,
};



exports.UserServiceRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserServiceRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserServiceRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
  };
}
,
};



exports.UserServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Service.User:UserServiceRequest',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Service.User:UserServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, user: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    user: damlTypes.Party.encode(__typed__.user),
  };
}
,
  UserServiceRequest_Accept: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'UserServiceRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserServiceRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserServiceRequest_Accept_Result.encode(__typed__); },
  },
  UserServiceRequest_Cancel: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'UserServiceRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserServiceRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserServiceRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  UserServiceRequest_Reject: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'UserServiceRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserServiceRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserServiceRequest_Reject_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UserServiceRequest, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);



exports.DistributionSlice = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, percentage: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
    percentage: damlTypes.Numeric(10).encode(__typed__.percentage),
  };
}
,
};



exports.UserService_Terminate_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserService_OfferPaidCredential_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).encode(__typed__.credentialOfferCid),
  };
}
,
};



exports.UserService_OfferFreeCredential_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).encode(__typed__.credentialOfferCid),
  };
}
,
};



exports.UserService_DistributeMulti_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferResults: damlTypes.List(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult).decoder, }); }),
  encode: function (__typed__) {
  return {
    transferResults: damlTypes.List(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult).encode(__typed__.transferResults),
  };
}
,
};



exports.UserService_DistributeAndAdjustDepositMulti_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferResults: damlTypes.List(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult).decoder, }); }),
  encode: function (__typed__) {
  return {
    transferResults: damlTypes.List(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult).encode(__typed__.transferResults),
  };
}
,
};



exports.UserService_RevokeCredentialAndCancelBilling = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialCid: damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential).decoder, credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialCid: damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential).encode(__typed__.credentialCid),
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.UserService_CancelCredentialBilling = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.UserService_RevokeCredential = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialCid: damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialCid: damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential).encode(__typed__.credentialCid),
  };
}
,
};



exports.UserService_BillingParamsAdjustmentRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({requestCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    requestCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest).encode(__typed__.requestCid),
  };
}
,
};



exports.UserService_BillingParamsAdjustmentRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({requestCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest).decoder, credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, }); }),
  encode: function (__typed__) {
  return {
    requestCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest).encode(__typed__.requestCid),
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
  };
}
,
};



exports.UserService_RequestToAdjustBillingParams = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, billingParams: Utility_Credential_App_V0_Types.BillingParams.decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
    billingParams: Utility_Credential_App_V0_Types.BillingParams.encode(__typed__.billingParams),
  };
}
,
};



exports.UserService_AdjustBillingParams = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, billingParams: Utility_Credential_App_V0_Types.BillingParams.decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
    billingParams: Utility_Credential_App_V0_Types.BillingParams.encode(__typed__.billingParams),
  };
}
,
};



exports.UserService_TopUp = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, amountUsd: damlTypes.Numeric(10).decoder, coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
    amountUsd: damlTypes.Numeric(10).encode(__typed__.amountUsd),
    coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.coinCids),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.UserService_DistributeAndAdjustDepositMulti = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({distributionSlices: damlTypes.List(exports.DistributionSlice).decoder, amountUsd: damlTypes.Numeric(10).decoder, coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    distributionSlices: damlTypes.List(exports.DistributionSlice).encode(__typed__.distributionSlices),
    amountUsd: damlTypes.Numeric(10).encode(__typed__.amountUsd),
    coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.coinCids),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.UserService_DistributeAndAdjustDeposit = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, amountUsd: damlTypes.Numeric(10).decoder, coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
    amountUsd: damlTypes.Numeric(10).encode(__typed__.amountUsd),
    coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.coinCids),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.UserService_DistributeMulti = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({distributionSlices: damlTypes.List(exports.DistributionSlice).decoder, amountUsd: damlTypes.Numeric(10).decoder, coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    distributionSlices: damlTypes.List(exports.DistributionSlice).encode(__typed__.distributionSlices),
    amountUsd: damlTypes.Numeric(10).encode(__typed__.amountUsd),
    coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.coinCids),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.UserService_Distribute = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).decoder, amountUsd: damlTypes.Numeric(10).decoder, coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Billing.CredentialBilling).encode(__typed__.credentialBillingCid),
    amountUsd: damlTypes.Numeric(10).encode(__typed__.amountUsd),
    coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.coinCids),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.UserService_CancelCredentialOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).encode(__typed__.credentialOfferCid),
  };
}
,
};



exports.UserService_RejectCredentialOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).encode(__typed__.credentialOfferCid),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.UserService_AcceptFreeCredentialOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).encode(__typed__.credentialOfferCid),
  };
}
,
};



exports.UserService_AcceptPaidCredentialOffer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).decoder, depositAmulets: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialOfferCid: damlTypes.ContractId(Utility_Credential_App_V0_Model_Offer.CredentialOffer).encode(__typed__.credentialOfferCid),
    depositAmulets: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.depositAmulets),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.UserService_OfferFreeCredential = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holder: damlTypes.Party.decoder, id: damlTypes.Text.decoder, description: damlTypes.Text.decoder, claims: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Claim).decoder, }); }),
  encode: function (__typed__) {
  return {
    holder: damlTypes.Party.encode(__typed__.holder),
    id: damlTypes.Text.encode(__typed__.id),
    description: damlTypes.Text.encode(__typed__.description),
    claims: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Claim).encode(__typed__.claims),
  };
}
,
};



exports.UserService_OfferPaidCredential = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holder: damlTypes.Party.decoder, id: damlTypes.Text.decoder, description: damlTypes.Text.decoder, claims: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Claim).decoder, billingParams: Utility_Credential_App_V0_Types.BillingParams.decoder, depositInitialAmountUsd: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), }); }),
  encode: function (__typed__) {
  return {
    holder: damlTypes.Party.encode(__typed__.holder),
    id: damlTypes.Text.encode(__typed__.id),
    description: damlTypes.Text.encode(__typed__.description),
    claims: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Claim).encode(__typed__.claims),
    billingParams: Utility_Credential_App_V0_Types.BillingParams.encode(__typed__.billingParams),
    depositInitialAmountUsd: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.depositInitialAmountUsd),
  };
}
,
};



exports.UserService_Terminate = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.UserService = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Service.User:UserService',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Service.User:UserService',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, user: damlTypes.Party.decoder, dso: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    user: damlTypes.Party.encode(__typed__.user),
    dso: damlTypes.Party.encode(__typed__.dso),
  };
}
,
  UserService_OfferPaidCredential: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_OfferPaidCredential',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_OfferPaidCredential.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_OfferPaidCredential.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserService_OfferPaidCredential_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserService_OfferPaidCredential_Result.encode(__typed__); },
  },
  UserService_OfferFreeCredential: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_OfferFreeCredential',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_OfferFreeCredential.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_OfferFreeCredential.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserService_OfferFreeCredential_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserService_OfferFreeCredential_Result.encode(__typed__); },
  },
  UserService_AcceptPaidCredentialOffer: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_AcceptPaidCredentialOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_AcceptPaidCredentialOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_AcceptPaidCredentialOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Offer.CredentialOffer_AcceptPaid_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Offer.CredentialOffer_AcceptPaid_Result.encode(__typed__); },
  },
  UserService_AcceptFreeCredentialOffer: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_AcceptFreeCredentialOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_AcceptFreeCredentialOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_AcceptFreeCredentialOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Offer.CredentialOffer_AcceptFree_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Offer.CredentialOffer_AcceptFree_Result.encode(__typed__); },
  },
  UserService_RejectCredentialOffer: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_RejectCredentialOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_RejectCredentialOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_RejectCredentialOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Offer.CredentialOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Offer.CredentialOffer_Reject_Result.encode(__typed__); },
  },
  UserService_CancelCredentialOffer: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_CancelCredentialOffer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_CancelCredentialOffer.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_CancelCredentialOffer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Offer.CredentialOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Offer.CredentialOffer_Cancel_Result.encode(__typed__); },
  },
  UserService_Distribute: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_Distribute',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_Distribute.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_Distribute.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_Distribute_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_Distribute_Result.encode(__typed__); },
  },
  UserService_DistributeMulti: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_DistributeMulti',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_DistributeMulti.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_DistributeMulti.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserService_DistributeMulti_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserService_DistributeMulti_Result.encode(__typed__); },
  },
  UserService_DistributeAndAdjustDeposit: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_DistributeAndAdjustDeposit',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_DistributeAndAdjustDeposit.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_DistributeAndAdjustDeposit.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_DistributeAndAdjustDeposit_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_DistributeAndAdjustDeposit_Result.encode(__typed__); },
  },
  UserService_DistributeAndAdjustDepositMulti: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_DistributeAndAdjustDepositMulti',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_DistributeAndAdjustDepositMulti.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_DistributeAndAdjustDepositMulti.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserService_DistributeAndAdjustDepositMulti_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserService_DistributeAndAdjustDepositMulti_Result.encode(__typed__); },
  },
  UserService_TopUp: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_TopUp',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_TopUp.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_TopUp.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_TopUp_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_TopUp_Result.encode(__typed__); },
  },
  UserService_AdjustBillingParams: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_AdjustBillingParams',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_AdjustBillingParams.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_AdjustBillingParams.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_AdjustBillingParams_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_AdjustBillingParams_Result.encode(__typed__); },
  },
  UserService_RequestToAdjustBillingParams: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_RequestToAdjustBillingParams',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_RequestToAdjustBillingParams.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_RequestToAdjustBillingParams.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_RequestToAdjustBillingParams_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_RequestToAdjustBillingParams_Result.encode(__typed__); },
  },
  UserService_BillingParamsAdjustmentRequest_Accept: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_BillingParamsAdjustmentRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_BillingParamsAdjustmentRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_BillingParamsAdjustmentRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest_Accept_Result.encode(__typed__); },
  },
  UserService_BillingParamsAdjustmentRequest_Cancel: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_BillingParamsAdjustmentRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_BillingParamsAdjustmentRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_BillingParamsAdjustmentRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest_Cancel_Result.encode(__typed__); },
  },
  UserService_RevokeCredential: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_RevokeCredential',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_RevokeCredential.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_RevokeCredential.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential_Revoke_Result.decoder; }),
    resultEncode: function (__typed__) { return pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential_Revoke_Result.encode(__typed__); },
  },
  UserService_CancelCredentialBilling: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_CancelCredentialBilling',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_CancelCredentialBilling.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_CancelCredentialBilling.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_Cancel_Result.encode(__typed__); },
  },
  UserService_RevokeCredentialAndCancelBilling: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_RevokeCredentialAndCancelBilling',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_RevokeCredentialAndCancelBilling.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_RevokeCredentialAndCancelBilling.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Model_Billing.CredentialBilling_Cancel_Result.encode(__typed__); },
  },
  UserService_Terminate: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_Terminate',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_Terminate.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_Terminate.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserService_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserService_Terminate_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.UserService; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UserService, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);

