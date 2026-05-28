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

var Utility_Settlement_App_V1_Model_Configuration_Operator = require('../../../../../../Utility/Settlement/App/V1/Model/Configuration/Operator/module');
var Utility_Settlement_App_V1_Model_Dvp = require('../../../../../../Utility/Settlement/App/V1/Model/Dvp/module');


exports.UserServiceRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserServiceRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
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



exports.UserService_Terminate_Result = {
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



exports.UserServiceRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.UserServiceRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operatorConfigurationCid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Configuration_Operator.OperatorConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, }); }),
  encode: function (__typed__) {
  return {
    operatorConfigurationCid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Configuration_Operator.OperatorConfiguration).encode(__typed__.operatorConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
  };
}
,
};



exports.UserServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-settlement-app-v1:Utility.Settlement.App.V1.Service.User:UserServiceRequest',
  templateIdWithPackageId: 'f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639:Utility.Settlement.App.V1.Service.User:UserServiceRequest',
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
  UserServiceRequest_Reject: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'UserServiceRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserServiceRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserServiceRequest_Reject_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  UserServiceRequest_Cancel: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'UserServiceRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserServiceRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserServiceRequest_Cancel_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UserServiceRequest, ['f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639', '#utility-settlement-app-v1']);



exports.UserService_CreateDvpProposal_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserService_CancelDvpProposal_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserService_ProposeDvp_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dvpProposalCid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Dvp.DvpProposal).decoder, }); }),
  encode: function (__typed__) {
  return {
    dvpProposalCid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Dvp.DvpProposal).encode(__typed__.dvpProposalCid),
  };
}
,
};



exports.UserService_RejectDvpProposal = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Dvp.DvpProposal).decoder, payload: Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Dvp.DvpProposal).encode(__typed__.cid),
    payload: Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Reject.encode(__typed__.payload),
  };
}
,
};



exports.UserService_CancelDvpProposal = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Dvp.DvpProposal).decoder, payload: Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Dvp.DvpProposal).encode(__typed__.cid),
    payload: Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.UserService_AcceptDvpProposal = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Dvp.DvpProposal).decoder, payload: Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Settlement_App_V1_Model_Dvp.DvpProposal).encode(__typed__.cid),
    payload: Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Accept.encode(__typed__.payload),
  };
}
,
};



exports.UserService_ProposeDvp = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({proposerIsBuyer: damlTypes.Bool.decoder, counterparty: damlTypes.Party.decoder, terms: Utility_Settlement_App_V1_Model_Dvp.Terms.decoder, }); }),
  encode: function (__typed__) {
  return {
    proposerIsBuyer: damlTypes.Bool.encode(__typed__.proposerIsBuyer),
    counterparty: damlTypes.Party.encode(__typed__.counterparty),
    terms: Utility_Settlement_App_V1_Model_Dvp.Terms.encode(__typed__.terms),
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
  templateId: '#utility-settlement-app-v1:Utility.Settlement.App.V1.Service.User:UserService',
  templateIdWithPackageId: 'f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639:Utility.Settlement.App.V1.Service.User:UserService',
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
  UserService_Terminate: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_Terminate',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_Terminate.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_Terminate.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserService_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserService_Terminate_Result.encode(__typed__); },
  },
  UserService_ProposeDvp: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_ProposeDvp',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_ProposeDvp.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_ProposeDvp.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserService_ProposeDvp_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserService_ProposeDvp_Result.encode(__typed__); },
  },
  UserService_AcceptDvpProposal: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_AcceptDvpProposal',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_AcceptDvpProposal.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_AcceptDvpProposal.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Accept_Result.encode(__typed__); },
  },
  UserService_CancelDvpProposal: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_CancelDvpProposal',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_CancelDvpProposal.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_CancelDvpProposal.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Cancel_Result.encode(__typed__); },
  },
  UserService_RejectDvpProposal: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_RejectDvpProposal',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_RejectDvpProposal.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_RejectDvpProposal.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Reject_Result.encode(__typed__); },
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


damlTypes.registerTemplate(exports.UserService, ['f169e1d84c476cb1321eff8ac2aebc9ce1c6b20790db5e788ee4ca87256a0639', '#utility-settlement-app-v1']);

