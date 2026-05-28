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


exports.ExecutedUnlock_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedUnlock_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedUnlock_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.AcceptedUnlock_Fail_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({failedUnlockCid: damlTypes.ContractId(exports.FailedUnlock).decoder, }); }),
  encode: function (__typed__) {
  return {
    failedUnlockCid: damlTypes.ContractId(exports.FailedUnlock).encode(__typed__.failedUnlockCid),
  };
}
,
};



exports.AcceptedUnlock_Execute_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, remainingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder, executedUnlockCid: damlTypes.ContractId(exports.ExecutedUnlock).decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.holdingCid),
    remainingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.remainingCids),
    executedUnlockCid: damlTypes.ContractId(exports.ExecutedUnlock).encode(__typed__.executedUnlockCid),
  };
}
,
};



exports.UnlockRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UnlockRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedUnlockCid: damlTypes.ContractId(exports.RejectedUnlock).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedUnlockCid: damlTypes.ContractId(exports.RejectedUnlock).encode(__typed__.rejectedUnlockCid),
  };
}
,
};



exports.UnlockRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedUnlockCid: damlTypes.ContractId(exports.AcceptedUnlock).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedUnlockCid: damlTypes.ContractId(exports.AcceptedUnlock).encode(__typed__.acceptedUnlockCid),
  };
}
,
};



exports.UnlockOffer_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UnlockOffer_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedUnlockCid: damlTypes.ContractId(exports.RejectedUnlock).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedUnlockCid: damlTypes.ContractId(exports.RejectedUnlock).encode(__typed__.rejectedUnlockCid),
  };
}
,
};



exports.UnlockOffer_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedUnlockCid: damlTypes.ContractId(exports.AcceptedUnlock).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedUnlockCid: damlTypes.ContractId(exports.AcceptedUnlock).encode(__typed__.acceptedUnlockCid),
  };
}
,
};



exports.ExecutedUnlock_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExecutedUnlock_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.ExecutedUnlock = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:ExecutedUnlock',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Unlock:ExecutedUnlock',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unlock: exports.Unlock.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    unlock: exports.Unlock.encode(__typed__.unlock),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  ExecutedUnlock_Clean: {
    template: function () { return exports.ExecutedUnlock; },
    choiceName: 'ExecutedUnlock_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedUnlock_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedUnlock_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ExecutedUnlock; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  ExecutedUnlock_Delete: {
    template: function () { return exports.ExecutedUnlock; },
    choiceName: 'ExecutedUnlock_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedUnlock_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedUnlock_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedUnlock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ExecutedUnlock_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExecutedUnlock, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.FailedUnlock_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedUnlock_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.FailedUnlock = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:FailedUnlock',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Unlock:FailedUnlock',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unlock: exports.Unlock.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    unlock: exports.Unlock.encode(__typed__.unlock),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  FailedUnlock_Clean: {
    template: function () { return exports.FailedUnlock; },
    choiceName: 'FailedUnlock_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedUnlock_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedUnlock_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  FailedUnlock_Delete: {
    template: function () { return exports.FailedUnlock; },
    choiceName: 'FailedUnlock_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedUnlock_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedUnlock_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.FailedUnlock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.FailedUnlock_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.FailedUnlock; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.FailedUnlock, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.RejectedUnlock_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedUnlock_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RejectedUnlock = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:RejectedUnlock',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Unlock:RejectedUnlock',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unlock: exports.Unlock.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    unlock: exports.Unlock.encode(__typed__.unlock),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  RejectedUnlock_Clean: {
    template: function () { return exports.RejectedUnlock; },
    choiceName: 'RejectedUnlock_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedUnlock_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedUnlock_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RejectedUnlock_Delete: {
    template: function () { return exports.RejectedUnlock; },
    choiceName: 'RejectedUnlock_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedUnlock_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedUnlock_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedUnlock_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedUnlock_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.RejectedUnlock; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedUnlock, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.AcceptedUnlock_Fail = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.AcceptedUnlock_Execute = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, holdingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).encode(__typed__.instrumentConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
    holdingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.holdingCids),
  };
}
,
};



exports.AcceptedUnlock_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.AcceptedUnlock = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:AcceptedUnlock',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Unlock:AcceptedUnlock',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unlock: exports.Unlock.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    unlock: exports.Unlock.encode(__typed__.unlock),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  AcceptedUnlock_Clean: {
    template: function () { return exports.AcceptedUnlock; },
    choiceName: 'AcceptedUnlock_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedUnlock_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedUnlock_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  AcceptedUnlock_Execute: {
    template: function () { return exports.AcceptedUnlock; },
    choiceName: 'AcceptedUnlock_Execute',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedUnlock_Execute.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedUnlock_Execute.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedUnlock_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedUnlock_Execute_Result.encode(__typed__); },
  },
  AcceptedUnlock_Fail: {
    template: function () { return exports.AcceptedUnlock; },
    choiceName: 'AcceptedUnlock_Fail',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedUnlock_Fail.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedUnlock_Fail.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedUnlock_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedUnlock_Fail_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AcceptedUnlock; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AcceptedUnlock, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.UnlockRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UnlockRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.UnlockRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
};



exports.UnlockRequest_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.UnlockRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:UnlockRequest',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Unlock:UnlockRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unlock: exports.Unlock.decoder, }); }),
  encode: function (__typed__) {
  return {
    unlock: exports.Unlock.encode(__typed__.unlock),
  };
}
,
  UnlockRequest_Clean: {
    template: function () { return exports.UnlockRequest; },
    choiceName: 'UnlockRequest_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UnlockRequest_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.UnlockRequest_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  UnlockRequest_Accept: {
    template: function () { return exports.UnlockRequest; },
    choiceName: 'UnlockRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UnlockRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.UnlockRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UnlockRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UnlockRequest_Accept_Result.encode(__typed__); },
  },
  UnlockRequest_Reject: {
    template: function () { return exports.UnlockRequest; },
    choiceName: 'UnlockRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UnlockRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.UnlockRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UnlockRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UnlockRequest_Reject_Result.encode(__typed__); },
  },
  UnlockRequest_Cancel: {
    template: function () { return exports.UnlockRequest; },
    choiceName: 'UnlockRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UnlockRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.UnlockRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UnlockRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UnlockRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.UnlockRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UnlockRequest, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.UnlockOffer_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UnlockOffer_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.UnlockOffer_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UnlockOffer_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.UnlockOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:UnlockOffer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Unlock:UnlockOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unlock: exports.Unlock.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    unlock: exports.Unlock.encode(__typed__.unlock),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  UnlockOffer_Clean: {
    template: function () { return exports.UnlockOffer; },
    choiceName: 'UnlockOffer_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UnlockOffer_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.UnlockOffer_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  UnlockOffer_Accept: {
    template: function () { return exports.UnlockOffer; },
    choiceName: 'UnlockOffer_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UnlockOffer_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.UnlockOffer_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UnlockOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UnlockOffer_Accept_Result.encode(__typed__); },
  },
  UnlockOffer_Reject: {
    template: function () { return exports.UnlockOffer; },
    choiceName: 'UnlockOffer_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UnlockOffer_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.UnlockOffer_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UnlockOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UnlockOffer_Reject_Result.encode(__typed__); },
  },
  UnlockOffer_Cancel: {
    template: function () { return exports.UnlockOffer; },
    choiceName: 'UnlockOffer_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UnlockOffer_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.UnlockOffer_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UnlockOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UnlockOffer_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.UnlockOffer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UnlockOffer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.Unlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, locker: damlTypes.Party.decoder, lockContext: damlTypes.Text.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, reference: damlTypes.Text.decoder, batch: Utility_Registry_V0_Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    holder: damlTypes.Party.encode(__typed__.holder),
    locker: damlTypes.Party.encode(__typed__.locker),
    lockContext: damlTypes.Text.encode(__typed__.lockContext),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: Utility_Registry_V0_Types.Batch.encode(__typed__.batch),
  };
}
,
};

