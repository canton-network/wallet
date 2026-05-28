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

var Utility_Registry_V0_Configuration_Instrument = require('../../../../../Utility/Registry/V0/Configuration/Instrument/module');
var Utility_Registry_V0_Types = require('../../../../../Utility/Registry/V0/Types/module');


exports.ExecutedLock_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedLock_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedLock_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.AcceptedLock_Fail_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({failedLockCid: damlTypes.ContractId(exports.FailedLock).decoder, }); }),
  encode: function (__typed__) {
  return {
    failedLockCid: damlTypes.ContractId(exports.FailedLock).encode(__typed__.failedLockCid),
  };
}
,
};



exports.AcceptedLock_Execute_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingLockResult: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Lock_Result.decoder, executedLockCid: damlTypes.ContractId(exports.ExecutedLock).decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingLockResult: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Lock_Result.encode(__typed__.holdingLockResult),
    executedLockCid: damlTypes.ContractId(exports.ExecutedLock).encode(__typed__.executedLockCid),
  };
}
,
};



exports.LockRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.LockRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedLockCid: damlTypes.ContractId(exports.RejectedLock).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedLockCid: damlTypes.ContractId(exports.RejectedLock).encode(__typed__.rejectedLockCid),
  };
}
,
};



exports.LockRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedLockCid: damlTypes.ContractId(exports.AcceptedLock).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedLockCid: damlTypes.ContractId(exports.AcceptedLock).encode(__typed__.acceptedLockCid),
  };
}
,
};



exports.LockOffer_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.LockOffer_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedLockCid: damlTypes.ContractId(exports.RejectedLock).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedLockCid: damlTypes.ContractId(exports.RejectedLock).encode(__typed__.rejectedLockCid),
  };
}
,
};



exports.LockOffer_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedLockCid: damlTypes.ContractId(exports.AcceptedLock).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedLockCid: damlTypes.ContractId(exports.AcceptedLock).encode(__typed__.acceptedLockCid),
  };
}
,
};



exports.ExecutedLock_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExecutedLock_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.ExecutedLock = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:ExecutedLock',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Lock:ExecutedLock',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lock: exports.Lock.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    lock: exports.Lock.encode(__typed__.lock),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  ExecutedLock_Clean: {
    template: function () { return exports.ExecutedLock; },
    choiceName: 'ExecutedLock_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedLock_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedLock_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ExecutedLock; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  ExecutedLock_Delete: {
    template: function () { return exports.ExecutedLock; },
    choiceName: 'ExecutedLock_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedLock_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedLock_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedLock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ExecutedLock_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExecutedLock, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.FailedLock_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedLock_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.FailedLock = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:FailedLock',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Lock:FailedLock',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lock: exports.Lock.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    lock: exports.Lock.encode(__typed__.lock),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  FailedLock_Clean: {
    template: function () { return exports.FailedLock; },
    choiceName: 'FailedLock_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedLock_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedLock_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  FailedLock_Delete: {
    template: function () { return exports.FailedLock; },
    choiceName: 'FailedLock_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedLock_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedLock_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.FailedLock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.FailedLock_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.FailedLock; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.FailedLock, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.RejectedLock_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedLock_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RejectedLock = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:RejectedLock',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Lock:RejectedLock',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lock: exports.Lock.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    lock: exports.Lock.encode(__typed__.lock),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  RejectedLock_Clean: {
    template: function () { return exports.RejectedLock; },
    choiceName: 'RejectedLock_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedLock_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedLock_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RejectedLock_Delete: {
    template: function () { return exports.RejectedLock; },
    choiceName: 'RejectedLock_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedLock_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedLock_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedLock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedLock_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.RejectedLock; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedLock, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.AcceptedLock_Fail = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.AcceptedLock_Execute = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).encode(__typed__.instrumentConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
    holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.holdingCid),
  };
}
,
};



exports.AcceptedLock_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.AcceptedLock = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:AcceptedLock',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Lock:AcceptedLock',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lock: exports.Lock.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    lock: exports.Lock.encode(__typed__.lock),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  AcceptedLock_Clean: {
    template: function () { return exports.AcceptedLock; },
    choiceName: 'AcceptedLock_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedLock_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedLock_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  AcceptedLock_Execute: {
    template: function () { return exports.AcceptedLock; },
    choiceName: 'AcceptedLock_Execute',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedLock_Execute.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedLock_Execute.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedLock_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedLock_Execute_Result.encode(__typed__); },
  },
  AcceptedLock_Fail: {
    template: function () { return exports.AcceptedLock; },
    choiceName: 'AcceptedLock_Fail',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedLock_Fail.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedLock_Fail.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedLock_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedLock_Fail_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AcceptedLock; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AcceptedLock, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.LockRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.LockRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.LockRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
};



exports.LockRequest_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.LockRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:LockRequest',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Lock:LockRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lock: exports.Lock.decoder, }); }),
  encode: function (__typed__) {
  return {
    lock: exports.Lock.encode(__typed__.lock),
  };
}
,
  LockRequest_Clean: {
    template: function () { return exports.LockRequest; },
    choiceName: 'LockRequest_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockRequest_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockRequest_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  LockRequest_Accept: {
    template: function () { return exports.LockRequest; },
    choiceName: 'LockRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.LockRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.LockRequest_Accept_Result.encode(__typed__); },
  },
  LockRequest_Reject: {
    template: function () { return exports.LockRequest; },
    choiceName: 'LockRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.LockRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.LockRequest_Reject_Result.encode(__typed__); },
  },
  LockRequest_Cancel: {
    template: function () { return exports.LockRequest; },
    choiceName: 'LockRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.LockRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.LockRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.LockRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.LockRequest, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.LockOffer_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.LockOffer_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.LockOffer_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.LockOffer_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.LockOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:LockOffer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Lock:LockOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lock: exports.Lock.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    lock: exports.Lock.encode(__typed__.lock),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  LockOffer_Clean: {
    template: function () { return exports.LockOffer; },
    choiceName: 'LockOffer_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockOffer_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockOffer_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  LockOffer_Accept: {
    template: function () { return exports.LockOffer; },
    choiceName: 'LockOffer_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockOffer_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockOffer_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.LockOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.LockOffer_Accept_Result.encode(__typed__); },
  },
  LockOffer_Reject: {
    template: function () { return exports.LockOffer; },
    choiceName: 'LockOffer_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockOffer_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockOffer_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.LockOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.LockOffer_Reject_Result.encode(__typed__); },
  },
  LockOffer_Cancel: {
    template: function () { return exports.LockOffer; },
    choiceName: 'LockOffer_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockOffer_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockOffer_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.LockOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.LockOffer_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.LockOffer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.LockOffer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.Lock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, locker: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, context: damlTypes.Text.decoder, reference: damlTypes.Text.decoder, batch: Utility_Registry_V0_Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    holder: damlTypes.Party.encode(__typed__.holder),
    locker: damlTypes.Party.encode(__typed__.locker),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    context: damlTypes.Text.encode(__typed__.context),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: Utility_Registry_V0_Types.Batch.encode(__typed__.batch),
  };
}
,
};

