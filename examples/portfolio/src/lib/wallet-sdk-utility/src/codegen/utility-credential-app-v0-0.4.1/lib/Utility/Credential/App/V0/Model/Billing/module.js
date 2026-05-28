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

var pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda = require('@daml.js/splice-api-featured-app-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 = require('@daml.js/splice-amulet-0.1.16');

var Utility_Credential_App_V0_Model_Accounting = require('../../../../../../Utility/Credential/App/V0/Model/Accounting/module');
var Utility_Credential_App_V0_Types = require('../../../../../../Utility/Credential/App/V0/Types/module');


exports.BillingParamsAdjustmentRequest_Cancel_Result = {
  BillingParamsAdjustmentRequest_Cancel_Result: 'BillingParamsAdjustmentRequest_Cancel_Result',
  keys: ['BillingParamsAdjustmentRequest_Cancel_Result',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.BillingParamsAdjustmentRequest_Cancel_Result.BillingParamsAdjustmentRequest_Cancel_Result)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.BillingParamsAdjustmentRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).encode(__typed__.credentialBillingCid),
  };
}
,
};



exports.CredentialBilling_RequestToAdjustBillingParams_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({requestCid: damlTypes.ContractId(exports.BillingParamsAdjustmentRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    requestCid: damlTypes.ContractId(exports.BillingParamsAdjustmentRequest).encode(__typed__.requestCid),
  };
}
,
};



exports.BillingParamsAdjustmentRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.BillingParamsAdjustmentRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).decoder, }); }),
  encode: function (__typed__) {
  return {
    credentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).encode(__typed__.credentialBillingCid),
  };
}
,
};



exports.BillingParamsAdjustmentRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Billing:BillingParamsAdjustmentRequest',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Model.Billing:BillingParamsAdjustmentRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, issuer: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, params: Utility_Credential_App_V0_Types.BillingParams.decoder, credentialId: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    issuer: damlTypes.Party.encode(__typed__.issuer),
    holder: damlTypes.Party.encode(__typed__.holder),
    params: Utility_Credential_App_V0_Types.BillingParams.encode(__typed__.params),
    credentialId: damlTypes.Text.encode(__typed__.credentialId),
  };
}
,
  BillingParamsAdjustmentRequest_Accept: {
    template: function () { return exports.BillingParamsAdjustmentRequest; },
    choiceName: 'BillingParamsAdjustmentRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BillingParamsAdjustmentRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.BillingParamsAdjustmentRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.BillingParamsAdjustmentRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.BillingParamsAdjustmentRequest_Accept_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.BillingParamsAdjustmentRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  BillingParamsAdjustmentRequest_Cancel: {
    template: function () { return exports.BillingParamsAdjustmentRequest; },
    choiceName: 'BillingParamsAdjustmentRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BillingParamsAdjustmentRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.BillingParamsAdjustmentRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.BillingParamsAdjustmentRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.BillingParamsAdjustmentRequest_Cancel_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.BillingParamsAdjustmentRequest, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);



exports.CanceledCredentialBilling = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Billing:CanceledCredentialBilling',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Model.Billing:CanceledCredentialBilling',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({payload: exports.CredentialBilling.decoder, cancelledBy: damlTypes.Party.decoder, cancelledAt: damlTypes.Time.decoder, returnedUserAmountCc: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    payload: exports.CredentialBilling.encode(__typed__.payload),
    cancelledBy: damlTypes.Party.encode(__typed__.cancelledBy),
    cancelledAt: damlTypes.Time.encode(__typed__.cancelledAt),
    returnedUserAmountCc: damlTypes.Numeric(10).encode(__typed__.returnedUserAmountCc),
  };
}
,
  Archive: {
    template: function () { return exports.CanceledCredentialBilling; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CanceledCredentialBilling, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);



exports.CredentialBilling_TopUp_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).decoder, }); }),
  encode: function (__typed__) {
  return {
    newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).encode(__typed__.newCredentialBillingCid),
  };
}
,
};



exports.CredentialBilling_FlushExpiredDeposit_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).decoder, }); }),
  encode: function (__typed__) {
  return {
    newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).encode(__typed__.newCredentialBillingCid),
  };
}
,
};



exports.CredentialBilling_DistributeAndAdjustDeposit_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).decoder, transferResult: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult.decoder, }); }),
  encode: function (__typed__) {
  return {
    newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).encode(__typed__.newCredentialBillingCid),
    transferResult: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult.encode(__typed__.transferResult),
  };
}
,
};



exports.CredentialBilling_Distribute_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferResult: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult.decoder, }); }),
  encode: function (__typed__) {
  return {
    transferResult: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult.encode(__typed__.transferResult),
  };
}
,
};



exports.CredentialBilling_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({canceledCredentialBillingCid: damlTypes.ContractId(exports.CanceledCredentialBilling).decoder, }); }),
  encode: function (__typed__) {
  return {
    canceledCredentialBillingCid: damlTypes.ContractId(exports.CanceledCredentialBilling).encode(__typed__.canceledCredentialBillingCid),
  };
}
,
};



exports.CredentialBilling_Bill_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({billingCycleParams: Utility_Credential_App_V0_Types.BillingCycleParams.decoder, transferResult: jtv.Decoder.withDefault(null, damlTypes.Optional(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult).decoder), newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).decoder, feeRecordCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Utility_Credential_App_V0_Model_Accounting.FeeRecord)).decoder), }); }),
  encode: function (__typed__) {
  return {
    billingCycleParams: Utility_Credential_App_V0_Types.BillingCycleParams.encode(__typed__.billingCycleParams),
    transferResult: damlTypes.Optional(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult).encode(__typed__.transferResult),
    newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).encode(__typed__.newCredentialBillingCid),
    feeRecordCid: damlTypes.Optional(damlTypes.ContractId(Utility_Credential_App_V0_Model_Accounting.FeeRecord)).encode(__typed__.feeRecordCid),
  };
}
,
};



exports.CredentialBilling_AdjustBillingParams_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).decoder, }); }),
  encode: function (__typed__) {
  return {
    newCredentialBillingCid: damlTypes.ContractId(exports.CredentialBilling).encode(__typed__.newCredentialBillingCid),
  };
}
,
};



exports.CredentialBilling_TopUp = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amountUsd: damlTypes.Numeric(10).decoder, coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    amountUsd: damlTypes.Numeric(10).encode(__typed__.amountUsd),
    coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.coinCids),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.CredentialBilling_DistributeAndAdjustDeposit = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amountUsd: damlTypes.Numeric(10).decoder, coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    amountUsd: damlTypes.Numeric(10).encode(__typed__.amountUsd),
    coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.coinCids),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.CredentialBilling_Distribute = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amountUsd: damlTypes.Numeric(10).decoder, coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    amountUsd: damlTypes.Numeric(10).encode(__typed__.amountUsd),
    coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.coinCids),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.CredentialBilling_FlushExpiredDeposit = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.CredentialBilling_CancelExpired = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.CredentialBilling_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
  };
}
,
};



exports.CredentialBilling_Bill = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, enableFeeRecord: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), rewardReceiver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), featuredAppRightCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppRight)).decoder), }); }),
  encode: function (__typed__) {
  return {
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
    enableFeeRecord: damlTypes.Optional(damlTypes.Bool).encode(__typed__.enableFeeRecord),
    rewardReceiver: damlTypes.Optional(damlTypes.Party).encode(__typed__.rewardReceiver),
    featuredAppRightCid: damlTypes.Optional(damlTypes.ContractId(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppRight)).encode(__typed__.featuredAppRightCid),
  };
}
,
};



exports.CredentialBilling_RequestToAdjustBillingParams = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newParams: Utility_Credential_App_V0_Types.BillingParams.decoder, }); }),
  encode: function (__typed__) {
  return {
    newParams: Utility_Credential_App_V0_Types.BillingParams.encode(__typed__.newParams),
  };
}
,
};



exports.CredentialBilling_AdjustBillingParams = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newParams: Utility_Credential_App_V0_Types.BillingParams.decoder, }); }),
  encode: function (__typed__) {
  return {
    newParams: Utility_Credential_App_V0_Types.BillingParams.encode(__typed__.newParams),
  };
}
,
};



exports.CredentialBilling = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Billing:CredentialBilling',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Model.Billing:CredentialBilling',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, issuer: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, dso: damlTypes.Party.decoder, credentialId: damlTypes.Text.decoder, params: Utility_Credential_App_V0_Types.BillingParams.decoder, balanceState: Utility_Credential_App_V0_Types.BalanceState.decoder, billingState: Utility_Credential_App_V0_Types.BillingState.decoder, deposits: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.LockedAmulet)).decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    issuer: damlTypes.Party.encode(__typed__.issuer),
    holder: damlTypes.Party.encode(__typed__.holder),
    dso: damlTypes.Party.encode(__typed__.dso),
    credentialId: damlTypes.Text.encode(__typed__.credentialId),
    params: Utility_Credential_App_V0_Types.BillingParams.encode(__typed__.params),
    balanceState: Utility_Credential_App_V0_Types.BalanceState.encode(__typed__.balanceState),
    billingState: Utility_Credential_App_V0_Types.BillingState.encode(__typed__.billingState),
    deposits: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.LockedAmulet)).encode(__typed__.deposits),
  };
}
,
  CredentialBilling_RequestToAdjustBillingParams: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'CredentialBilling_RequestToAdjustBillingParams',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_RequestToAdjustBillingParams.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialBilling_RequestToAdjustBillingParams.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_RequestToAdjustBillingParams_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialBilling_RequestToAdjustBillingParams_Result.encode(__typed__); },
  },
  CredentialBilling_DistributeAndAdjustDeposit: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'CredentialBilling_DistributeAndAdjustDeposit',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_DistributeAndAdjustDeposit.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialBilling_DistributeAndAdjustDeposit.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_DistributeAndAdjustDeposit_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialBilling_DistributeAndAdjustDeposit_Result.encode(__typed__); },
  },
  CredentialBilling_Bill: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'CredentialBilling_Bill',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_Bill.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialBilling_Bill.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_Bill_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialBilling_Bill_Result.encode(__typed__); },
  },
  CredentialBilling_Cancel: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'CredentialBilling_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialBilling_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialBilling_Cancel_Result.encode(__typed__); },
  },
  CredentialBilling_TopUp: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'CredentialBilling_TopUp',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_TopUp.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialBilling_TopUp.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_TopUp_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialBilling_TopUp_Result.encode(__typed__); },
  },
  CredentialBilling_Distribute: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'CredentialBilling_Distribute',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_Distribute.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialBilling_Distribute.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_Distribute_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialBilling_Distribute_Result.encode(__typed__); },
  },
  CredentialBilling_CancelExpired: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'CredentialBilling_CancelExpired',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_CancelExpired.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialBilling_CancelExpired.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialBilling_Cancel_Result.encode(__typed__); },
  },
  CredentialBilling_FlushExpiredDeposit: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'CredentialBilling_FlushExpiredDeposit',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_FlushExpiredDeposit.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialBilling_FlushExpiredDeposit.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_FlushExpiredDeposit_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialBilling_FlushExpiredDeposit_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  CredentialBilling_AdjustBillingParams: {
    template: function () { return exports.CredentialBilling; },
    choiceName: 'CredentialBilling_AdjustBillingParams',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_AdjustBillingParams.decoder; }),
    argumentEncode: function (__typed__) { return exports.CredentialBilling_AdjustBillingParams.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CredentialBilling_AdjustBillingParams_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CredentialBilling_AdjustBillingParams_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CredentialBilling, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);

