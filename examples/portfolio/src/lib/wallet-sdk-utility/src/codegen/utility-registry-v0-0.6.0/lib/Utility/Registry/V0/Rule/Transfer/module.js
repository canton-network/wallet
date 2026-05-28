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
var pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 = require('@daml.js/splice-api-token-transfer-instruction-v1-1.0.0');
var pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 = require('@daml.js/utility-credential-v0-0.1.0');
var pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda = require('@daml.js/splice-api-featured-app-v1-1.0.0');
var pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 = require('@daml.js/utility-registry-holding-v0-0.2.1');
var pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d = require('@daml.js/splice-api-token-allocation-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

var Utility_Registry_V0_Configuration_AppReward = require('../../../../../Utility/Registry/V0/Configuration/AppReward/module');
var Utility_Registry_V0_Configuration_Instrument = require('../../../../../Utility/Registry/V0/Configuration/Instrument/module');


exports.ExpectedInputHoldingLockState = {
  ExpectedUnlocked: 'ExpectedUnlocked',
  ExpectedLocked: 'ExpectedLocked',
  keys: ['ExpectedUnlocked','ExpectedLocked',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.ExpectedInputHoldingLockState.ExpectedUnlocked), jtv.constant(exports.ExpectedInputHoldingLockState.ExpectedLocked)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.TransferRule_Transfer_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({receiverHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, senderChangeCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder), }); }),
  encode: function (__typed__) {
  return {
    receiverHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.receiverHoldingCid),
    senderChangeCid: damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.senderChangeCid),
  };
}
,
};



exports.TransferRule_ExecuteAllocation_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({receiverHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, senderHoldingCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder), }); }),
  encode: function (__typed__) {
  return {
    receiverHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.receiverHoldingCid),
    senderHoldingCid: damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.senderHoldingCid),
  };
}
,
};



exports.TransferRule_AcceptTransferOffer_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({receiverHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, senderHoldingCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder), }); }),
  encode: function (__typed__) {
  return {
    receiverHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.receiverHoldingCid),
    senderHoldingCid: damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.senderHoldingCid),
  };
}
,
};



exports.TransferRule_DirectTransfer_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({receiverHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, senderHoldingCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder), }); }),
  encode: function (__typed__) {
  return {
    receiverHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.receiverHoldingCid),
    senderHoldingCid: damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.senderHoldingCid),
  };
}
,
};



exports.TransferRule_Transfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer.decoder, instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).decoder, senderCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, receiverCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, appRewardConfigurationCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Utility_Registry_V0_Configuration_AppReward.AppRewardConfiguration)).decoder), featuredAppRightCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppRight)).decoder), }); }),
  encode: function (__typed__) {
  return {
    transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer.encode(__typed__.transfer),
    instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).encode(__typed__.instrumentConfigurationCid),
    senderCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.senderCredentialCids),
    receiverCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.receiverCredentialCids),
    appRewardConfigurationCid: damlTypes.Optional(damlTypes.ContractId(Utility_Registry_V0_Configuration_AppReward.AppRewardConfiguration)).encode(__typed__.appRewardConfigurationCid),
    featuredAppRightCid: damlTypes.Optional(damlTypes.ContractId(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppRight)).encode(__typed__.featuredAppRightCid),
  };
}
,
};



exports.TransferRule_ExecuteAllocation = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({allocation: pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.AllocationView.decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, expectedOperator: damlTypes.Party.decoder, expectedProvider: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    allocation: pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.AllocationView.encode(__typed__.allocation),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    expectedOperator: damlTypes.Party.encode(__typed__.expectedOperator),
    expectedProvider: damlTypes.Party.encode(__typed__.expectedProvider),
  };
}
,
};



exports.TransferRule_TwoStepTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer.decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, expectedOperator: damlTypes.Party.decoder, expectedProvider: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer.encode(__typed__.transfer),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    expectedOperator: damlTypes.Party.encode(__typed__.expectedOperator),
    expectedProvider: damlTypes.Party.encode(__typed__.expectedProvider),
  };
}
,
};



exports.TransferRule_DirectTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer.decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, expectedOperator: damlTypes.Party.decoder, expectedProvider: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer.encode(__typed__.transfer),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    expectedOperator: damlTypes.Party.encode(__typed__.expectedOperator),
    expectedProvider: damlTypes.Optional(damlTypes.Party).encode(__typed__.expectedProvider),
  };
}
,
};



exports.TransferRule = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Rule.Transfer:TransferRule',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Rule.Transfer:TransferRule',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
  };
}
,
  TransferRule_DirectTransfer: {
    template: function () { return exports.TransferRule; },
    choiceName: 'TransferRule_DirectTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferRule_DirectTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferRule_DirectTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferRule_DirectTransfer_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferRule_DirectTransfer_Result.encode(__typed__); },
  },
  TransferRule_TwoStepTransfer: {
    template: function () { return exports.TransferRule; },
    choiceName: 'TransferRule_TwoStepTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferRule_TwoStepTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferRule_TwoStepTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferRule_AcceptTransferOffer_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferRule_AcceptTransferOffer_Result.encode(__typed__); },
  },
  TransferRule_ExecuteAllocation: {
    template: function () { return exports.TransferRule; },
    choiceName: 'TransferRule_ExecuteAllocation',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferRule_ExecuteAllocation.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferRule_ExecuteAllocation.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferRule_ExecuteAllocation_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferRule_ExecuteAllocation_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.TransferRule; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  TransferRule_Transfer: {
    template: function () { return exports.TransferRule; },
    choiceName: 'TransferRule_Transfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferRule_Transfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferRule_Transfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferRule_Transfer_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferRule_Transfer_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.TransferRule, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);

