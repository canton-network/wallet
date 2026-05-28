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

var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 = require('@daml.js/splice-amulet-0.1.16');

var Utility_Commercials_V0_Model_Types = require('../../../../../Utility/Commercials/V0/Model/Types/module');


exports.CommercialAgreement_BillBaseFee_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).encode(__typed__.commercialAgreementCid),
  };
}
,
};



exports.CommercialAgreement_SetDefaultCredentialFeeBillingState_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).decoder, credentialFeeBillingState: Utility_Commercials_V0_Model_Types.EventBillingState.decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).encode(__typed__.commercialAgreementCid),
    credentialFeeBillingState: Utility_Commercials_V0_Model_Types.EventBillingState.encode(__typed__.credentialFeeBillingState),
  };
}
,
};



exports.CommercialAgreement_BillCredentialFeeMultiUnfeatured_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).decoder, credentialFeeBillingState: Utility_Commercials_V0_Model_Types.EventBillingState.decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).encode(__typed__.commercialAgreementCid),
    credentialFeeBillingState: Utility_Commercials_V0_Model_Types.EventBillingState.encode(__typed__.credentialFeeBillingState),
  };
}
,
};



exports.CommercialAgreement_BillCredentialFeeMulti_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).decoder, credentialFeeBillingState: Utility_Commercials_V0_Model_Types.EventBillingState.decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).encode(__typed__.commercialAgreementCid),
    credentialFeeBillingState: Utility_Commercials_V0_Model_Types.EventBillingState.encode(__typed__.credentialFeeBillingState),
  };
}
,
};



exports.CommercialAgreement_Bill_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).encode(__typed__.commercialAgreementCid),
  };
}
,
};



exports.CommercialAgreement_LockCoin_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).encode(__typed__.commercialAgreementCid),
  };
}
,
};



exports.CommercialAgreement_FlushExpiredDeposit_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).encode(__typed__.commercialAgreementCid),
  };
}
,
};



exports.CommercialAgreement_Revoke_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unlockedDeposit: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, }); }),
  encode: function (__typed__) {
  return {
    unlockedDeposit: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.unlockedDeposit),
  };
}
,
};



exports.CommercialAgreement_Modify_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).encode(__typed__.commercialAgreementCid),
  };
}
,
};



exports.CommercialAgreement_ModifyDataPublishingConsent_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(exports.CommercialAgreement).encode(__typed__.commercialAgreementCid),
  };
}
,
};



exports.CommercialAgreement_BillBaseFee = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, transferPreapprovalCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval).decoder, paymentTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.PaymentTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.transferContext),
    transferPreapprovalCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval).encode(__typed__.transferPreapprovalCid),
    paymentTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.PaymentTransferContext.encode(__typed__.paymentTransferContext),
  };
}
,
};



exports.CommercialAgreement_SetDefaultCredentialFeeBillingState = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({currentLedgerOffset: damlTypes.Int.decoder, currentMigrationId: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder), }); }),
  encode: function (__typed__) {
  return {
    currentLedgerOffset: damlTypes.Int.encode(__typed__.currentLedgerOffset),
    currentMigrationId: damlTypes.Optional(damlTypes.Text).encode(__typed__.currentMigrationId),
  };
}
,
};



exports.CommercialAgreement_BillCredentialFeeMultiUnfeatured = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, transferPreapprovalCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval).decoder, numberOfBillings: damlTypes.Int.decoder, currentLedgerOffset: damlTypes.Int.decoder, payoutThresholdCc: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), currentMigrationId: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder), }); }),
  encode: function (__typed__) {
  return {
    transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.transferContext),
    transferPreapprovalCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval).encode(__typed__.transferPreapprovalCid),
    numberOfBillings: damlTypes.Int.encode(__typed__.numberOfBillings),
    currentLedgerOffset: damlTypes.Int.encode(__typed__.currentLedgerOffset),
    payoutThresholdCc: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.payoutThresholdCc),
    currentMigrationId: damlTypes.Optional(damlTypes.Text).encode(__typed__.currentMigrationId),
  };
}
,
};



exports.CommercialAgreement_BillCredentialFeeMulti = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, transferPreapprovalCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval).decoder, paymentTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.PaymentTransferContext.decoder, numberOfBillings: damlTypes.Int.decoder, currentLedgerOffset: damlTypes.Int.decoder, currentMigrationId: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder), }); }),
  encode: function (__typed__) {
  return {
    transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.transferContext),
    transferPreapprovalCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval).encode(__typed__.transferPreapprovalCid),
    paymentTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.PaymentTransferContext.encode(__typed__.paymentTransferContext),
    numberOfBillings: damlTypes.Int.encode(__typed__.numberOfBillings),
    currentLedgerOffset: damlTypes.Int.encode(__typed__.currentLedgerOffset),
    currentMigrationId: damlTypes.Optional(damlTypes.Text).encode(__typed__.currentMigrationId),
  };
}
,
};



exports.CommercialAgreement_Bill = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, transferPreapprovalCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval).decoder, paymentTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.PaymentTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.transferContext),
    transferPreapprovalCid: damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval).encode(__typed__.transferPreapprovalCid),
    paymentTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.PaymentTransferContext.encode(__typed__.paymentTransferContext),
  };
}
,
};



exports.CommercialAgreement_LockCoin = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({targetAmount: damlTypes.Numeric(10).decoder, coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    targetAmount: damlTypes.Numeric(10).encode(__typed__.targetAmount),
    coinCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.coinCids),
    transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.transferContext),
  };
}
,
};



exports.CommercialAgreement_FlushExpiredDeposit = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.CommercialAgreement_Revoke = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, actor: damlTypes.Party.decoder, transferPreapprovalCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval)).decoder), }); }),
  encode: function (__typed__) {
  return {
    transferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.transferContext),
    actor: damlTypes.Party.encode(__typed__.actor),
    transferPreapprovalCid: damlTypes.Optional(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferPreapproval)).encode(__typed__.transferPreapprovalCid),
  };
}
,
};



exports.CommercialAgreement_Modify = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({feeReceiver: damlTypes.Party.decoder, utilityFees: Utility_Commercials_V0_Model_Types.UtilityFees.decoder, rewardReceiver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    feeReceiver: damlTypes.Party.encode(__typed__.feeReceiver),
    utilityFees: Utility_Commercials_V0_Model_Types.UtilityFees.encode(__typed__.utilityFees),
    rewardReceiver: damlTypes.Optional(damlTypes.Party).encode(__typed__.rewardReceiver),
  };
}
,
};



exports.CommercialAgreement_ModifyDataPublishingConsent = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dataPublishingConsent: damlTypes.Bool.decoder, }); }),
  encode: function (__typed__) {
  return {
    dataPublishingConsent: damlTypes.Bool.encode(__typed__.dataPublishingConsent),
  };
}
,
};



exports.CommercialAgreement = damlTypes.assembleTemplate(
{
  templateId: '#utility-commercials-v0:Utility.Commercials.V0.Model.CommercialAgreement:CommercialAgreement',
  templateIdWithPackageId: 'fa5b1cc5c8368dff7c2e6a74aa2af9d520d755e2a508f44acd17343326e41839:Utility.Commercials.V0.Model.CommercialAgreement:CommercialAgreement',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, user: damlTypes.Party.decoder, feeReceiver: damlTypes.Party.decoder, lockedAmuletCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.LockedAmulet)).decoder, currentLockedAmuletAmountCc: damlTypes.Numeric(10).decoder, utilityFees: Utility_Commercials_V0_Model_Types.UtilityFees.decoder, dso: damlTypes.Party.decoder, baseFeeBillingState: jtv.Decoder.withDefault(null, damlTypes.Optional(Utility_Commercials_V0_Model_Types.BillingState).decoder), credentialFeeBillingState: jtv.Decoder.withDefault(null, damlTypes.Optional(Utility_Commercials_V0_Model_Types.EventBillingState).decoder), accruedFeesCc: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), rewardReceiver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), dataPublishingConsent: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    user: damlTypes.Party.encode(__typed__.user),
    feeReceiver: damlTypes.Party.encode(__typed__.feeReceiver),
    lockedAmuletCids: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.LockedAmulet)).encode(__typed__.lockedAmuletCids),
    currentLockedAmuletAmountCc: damlTypes.Numeric(10).encode(__typed__.currentLockedAmuletAmountCc),
    utilityFees: Utility_Commercials_V0_Model_Types.UtilityFees.encode(__typed__.utilityFees),
    dso: damlTypes.Party.encode(__typed__.dso),
    baseFeeBillingState: damlTypes.Optional(Utility_Commercials_V0_Model_Types.BillingState).encode(__typed__.baseFeeBillingState),
    credentialFeeBillingState: damlTypes.Optional(Utility_Commercials_V0_Model_Types.EventBillingState).encode(__typed__.credentialFeeBillingState),
    accruedFeesCc: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.accruedFeesCc),
    rewardReceiver: damlTypes.Optional(damlTypes.Party).encode(__typed__.rewardReceiver),
    dataPublishingConsent: damlTypes.Optional(damlTypes.Bool).encode(__typed__.dataPublishingConsent),
  };
}
,
  CommercialAgreement_Revoke: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_Revoke',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_Revoke.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_Revoke.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_Revoke_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_Revoke_Result.encode(__typed__); },
  },
  CommercialAgreement_BillCredentialFeeMultiUnfeatured: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_BillCredentialFeeMultiUnfeatured',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_BillCredentialFeeMultiUnfeatured.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_BillCredentialFeeMultiUnfeatured.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_BillCredentialFeeMultiUnfeatured_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_BillCredentialFeeMultiUnfeatured_Result.encode(__typed__); },
  },
  CommercialAgreement_BillCredentialFeeMulti: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_BillCredentialFeeMulti',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_BillCredentialFeeMulti.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_BillCredentialFeeMulti.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_BillCredentialFeeMulti_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_BillCredentialFeeMulti_Result.encode(__typed__); },
  },
  CommercialAgreement_BillBaseFee: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_BillBaseFee',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_BillBaseFee.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_BillBaseFee.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_BillBaseFee_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_BillBaseFee_Result.encode(__typed__); },
  },
  CommercialAgreement_LockCoin: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_LockCoin',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_LockCoin.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_LockCoin.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_LockCoin_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_LockCoin_Result.encode(__typed__); },
  },
  CommercialAgreement_Modify: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_Modify',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_Modify.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_Modify.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_Modify_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_Modify_Result.encode(__typed__); },
  },
  CommercialAgreement_FlushExpiredDeposit: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_FlushExpiredDeposit',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_FlushExpiredDeposit.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_FlushExpiredDeposit.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_FlushExpiredDeposit_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_FlushExpiredDeposit_Result.encode(__typed__); },
  },
  CommercialAgreement_SetDefaultCredentialFeeBillingState: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_SetDefaultCredentialFeeBillingState',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_SetDefaultCredentialFeeBillingState.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_SetDefaultCredentialFeeBillingState.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_SetDefaultCredentialFeeBillingState_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_SetDefaultCredentialFeeBillingState_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  CommercialAgreement_ModifyDataPublishingConsent: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_ModifyDataPublishingConsent',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_ModifyDataPublishingConsent.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_ModifyDataPublishingConsent.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_ModifyDataPublishingConsent_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_ModifyDataPublishingConsent_Result.encode(__typed__); },
  },
  CommercialAgreement_Bill: {
    template: function () { return exports.CommercialAgreement; },
    choiceName: 'CommercialAgreement_Bill',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_Bill.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreement_Bill.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreement_Bill_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreement_Bill_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CommercialAgreement, ['fa5b1cc5c8368dff7c2e6a74aa2af9d520d755e2a508f44acd17343326e41839', '#utility-commercials-v0']);

