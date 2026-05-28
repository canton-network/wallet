// Generated from Utility/Registry/V0/Holding/ForceTransfer.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Registry_V0_Configuration_Instrument from '../../../../../Utility/Registry/V0/Configuration/Instrument/module';
import * as Utility_Registry_V0_Holding_Transfer from '../../../../../Utility/Registry/V0/Holding/Transfer/module';

export declare type ExecutedForceTransfer_Delete_Result = {
};

export declare const ExecutedForceTransfer_Delete_Result:
  damlTypes.Serializable<ExecutedForceTransfer_Delete_Result> & {
  }
;


export declare type ExecutedForceTransfer_Delete = {
};

export declare const ExecutedForceTransfer_Delete:
  damlTypes.Serializable<ExecutedForceTransfer_Delete> & {
  }
;


export declare type ExecutedForceTransfer = {
  forceTransfer: ForceTransfer;
  registrarRationale: string;
};

export declare interface ExecutedForceTransferInterface {
  Archive: damlTypes.Choice<ExecutedForceTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedForceTransfer, undefined>>;
  ExecutedForceTransfer_Delete: damlTypes.Choice<ExecutedForceTransfer, ExecutedForceTransfer_Delete, ExecutedForceTransfer_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedForceTransfer, undefined>>;
}
export declare const ExecutedForceTransfer:
  damlTypes.Template<ExecutedForceTransfer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:ExecutedForceTransfer'> &
  damlTypes.ToInterface<ExecutedForceTransfer, never> &
  ExecutedForceTransferInterface;

export declare namespace ExecutedForceTransfer {
}



export declare type FailedForceTransfer_Delete_Result = {
};

export declare const FailedForceTransfer_Delete_Result:
  damlTypes.Serializable<FailedForceTransfer_Delete_Result> & {
  }
;


export declare type FailedForceTransfer_Delete = {
};

export declare const FailedForceTransfer_Delete:
  damlTypes.Serializable<FailedForceTransfer_Delete> & {
  }
;


export declare type FailedForceTransfer = {
  forceTransfer: ForceTransfer;
  reason: string;
};

export declare interface FailedForceTransferInterface {
  FailedForceTransfer_Delete: damlTypes.Choice<FailedForceTransfer, FailedForceTransfer_Delete, FailedForceTransfer_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedForceTransfer, undefined>>;
  Archive: damlTypes.Choice<FailedForceTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedForceTransfer, undefined>>;
}
export declare const FailedForceTransfer:
  damlTypes.Template<FailedForceTransfer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:FailedForceTransfer'> &
  damlTypes.ToInterface<FailedForceTransfer, never> &
  FailedForceTransferInterface;

export declare namespace FailedForceTransfer {
}



export declare type RejectedForceTransfer_Delete_Result = {
};

export declare const RejectedForceTransfer_Delete_Result:
  damlTypes.Serializable<RejectedForceTransfer_Delete_Result> & {
  }
;


export declare type RejectedForceTransfer_Delete = {
};

export declare const RejectedForceTransfer_Delete:
  damlTypes.Serializable<RejectedForceTransfer_Delete> & {
  }
;


export declare type RejectedForceTransfer = {
  forceTransfer: ForceTransfer;
  reason: string;
};

export declare interface RejectedForceTransferInterface {
  RejectedForceTransfer_Delete: damlTypes.Choice<RejectedForceTransfer, RejectedForceTransfer_Delete, RejectedForceTransfer_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedForceTransfer, undefined>>;
  Archive: damlTypes.Choice<RejectedForceTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedForceTransfer, undefined>>;
}
export declare const RejectedForceTransfer:
  damlTypes.Template<RejectedForceTransfer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:RejectedForceTransfer'> &
  damlTypes.ToInterface<RejectedForceTransfer, never> &
  RejectedForceTransferInterface;

export declare namespace RejectedForceTransfer {
}



export declare type AcceptedForceTransfer_Fail_Result = {
  failedForceTransferCid: damlTypes.ContractId<FailedForceTransfer>;
};

export declare const AcceptedForceTransfer_Fail_Result:
  damlTypes.Serializable<AcceptedForceTransfer_Fail_Result> & {
  }
;


export declare type AcceptedForceTransfer_Execute_Result = {
  holdingTransferResult: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Transfer_Result;
  executedForceTransferCid: damlTypes.ContractId<ExecutedForceTransfer>;
  remainingHoldingCids: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>[];
};

export declare const AcceptedForceTransfer_Execute_Result:
  damlTypes.Serializable<AcceptedForceTransfer_Execute_Result> & {
  }
;


export declare type AcceptedForceTransfer_Fail = {
  reason: string;
};

export declare const AcceptedForceTransfer_Fail:
  damlTypes.Serializable<AcceptedForceTransfer_Fail> & {
  }
;


export declare type AcceptedForceTransfer_Execute = {
  instrumentConfigurationCid: damlTypes.ContractId<Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration>;
  holdingCids: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>[];
  requestorCredentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
};

export declare const AcceptedForceTransfer_Execute:
  damlTypes.Serializable<AcceptedForceTransfer_Execute> & {
  }
;


export declare type AcceptedForceTransfer = {
  forceTransfer: ForceTransfer;
  registrarRationale: string;
};

export declare interface AcceptedForceTransferInterface {
  AcceptedForceTransfer_Execute: damlTypes.Choice<AcceptedForceTransfer, AcceptedForceTransfer_Execute, AcceptedForceTransfer_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedForceTransfer, undefined>>;
  AcceptedForceTransfer_Fail: damlTypes.Choice<AcceptedForceTransfer, AcceptedForceTransfer_Fail, AcceptedForceTransfer_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedForceTransfer, undefined>>;
  Archive: damlTypes.Choice<AcceptedForceTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedForceTransfer, undefined>>;
}
export declare const AcceptedForceTransfer:
  damlTypes.Template<AcceptedForceTransfer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:AcceptedForceTransfer'> &
  damlTypes.ToInterface<AcceptedForceTransfer, never> &
  AcceptedForceTransferInterface;

export declare namespace AcceptedForceTransfer {
}



export declare type ForceTransferRequest_Cancel_Result = {
};

export declare const ForceTransferRequest_Cancel_Result:
  damlTypes.Serializable<ForceTransferRequest_Cancel_Result> & {
  }
;


export declare type ForceTransferRequest_Reject_Result = {
  rejectedForceTransferCid: damlTypes.ContractId<RejectedForceTransfer>;
};

export declare const ForceTransferRequest_Reject_Result:
  damlTypes.Serializable<ForceTransferRequest_Reject_Result> & {
  }
;


export declare type ForceTransferRequest_Accept_Result = {
  acceptedForceTransferCid: damlTypes.ContractId<AcceptedForceTransfer>;
};

export declare const ForceTransferRequest_Accept_Result:
  damlTypes.Serializable<ForceTransferRequest_Accept_Result> & {
  }
;


export declare type ForceTransferRequest_Cancel = {
};

export declare const ForceTransferRequest_Cancel:
  damlTypes.Serializable<ForceTransferRequest_Cancel> & {
  }
;


export declare type ForceTransferRequest_Reject = {
  reason: string;
};

export declare const ForceTransferRequest_Reject:
  damlTypes.Serializable<ForceTransferRequest_Reject> & {
  }
;


export declare type ForceTransferRequest_Accept = {
  registrarRationale: string;
};

export declare const ForceTransferRequest_Accept:
  damlTypes.Serializable<ForceTransferRequest_Accept> & {
  }
;


export declare type ForceTransferRequest = {
  forceTransfer: ForceTransfer;
};

export declare interface ForceTransferRequestInterface {
  ForceTransferRequest_Accept: damlTypes.Choice<ForceTransferRequest, ForceTransferRequest_Accept, ForceTransferRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ForceTransferRequest, undefined>>;
  ForceTransferRequest_Reject: damlTypes.Choice<ForceTransferRequest, ForceTransferRequest_Reject, ForceTransferRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ForceTransferRequest, undefined>>;
  ForceTransferRequest_Cancel: damlTypes.Choice<ForceTransferRequest, ForceTransferRequest_Cancel, ForceTransferRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ForceTransferRequest, undefined>>;
  Archive: damlTypes.Choice<ForceTransferRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ForceTransferRequest, undefined>>;
}
export declare const ForceTransferRequest:
  damlTypes.Template<ForceTransferRequest, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:ForceTransferRequest'> &
  damlTypes.ToInterface<ForceTransferRequest, never> &
  ForceTransferRequestInterface;

export declare namespace ForceTransferRequest {
}



export declare type ForceTransfer = {
  requestor: damlTypes.Party;
  requestorRationale: string;
  transfer: Utility_Registry_V0_Holding_Transfer.Transfer;
  senderLabel: string;
  receiverLabel: string;
};

export declare const ForceTransfer:
  damlTypes.Serializable<ForceTransfer> & {
  }
;

