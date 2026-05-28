// Generated from Utility/Registry/V0/Holding/Lock.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Registry_V0_Configuration_Instrument from '../../../../../Utility/Registry/V0/Configuration/Instrument/module';
import * as Utility_Registry_V0_Types from '../../../../../Utility/Registry/V0/Types/module';

export declare type ExecutedLock_Delete_Result = {
};

export declare const ExecutedLock_Delete_Result:
  damlTypes.Serializable<ExecutedLock_Delete_Result> & {
  }
;


export declare type RejectedLock_Delete_Result = {
};

export declare const RejectedLock_Delete_Result:
  damlTypes.Serializable<RejectedLock_Delete_Result> & {
  }
;


export declare type FailedLock_Delete_Result = {
};

export declare const FailedLock_Delete_Result:
  damlTypes.Serializable<FailedLock_Delete_Result> & {
  }
;


export declare type AcceptedLock_Fail_Result = {
  failedLockCid: damlTypes.ContractId<FailedLock>;
};

export declare const AcceptedLock_Fail_Result:
  damlTypes.Serializable<AcceptedLock_Fail_Result> & {
  }
;


export declare type AcceptedLock_Execute_Result = {
  holdingLockResult: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Lock_Result;
  executedLockCid: damlTypes.ContractId<ExecutedLock>;
};

export declare const AcceptedLock_Execute_Result:
  damlTypes.Serializable<AcceptedLock_Execute_Result> & {
  }
;


export declare type LockRequest_Cancel_Result = {
};

export declare const LockRequest_Cancel_Result:
  damlTypes.Serializable<LockRequest_Cancel_Result> & {
  }
;


export declare type LockRequest_Reject_Result = {
  rejectedLockCid: damlTypes.ContractId<RejectedLock>;
};

export declare const LockRequest_Reject_Result:
  damlTypes.Serializable<LockRequest_Reject_Result> & {
  }
;


export declare type LockRequest_Accept_Result = {
  acceptedLockCid: damlTypes.ContractId<AcceptedLock>;
};

export declare const LockRequest_Accept_Result:
  damlTypes.Serializable<LockRequest_Accept_Result> & {
  }
;


export declare type LockOffer_Cancel_Result = {
};

export declare const LockOffer_Cancel_Result:
  damlTypes.Serializable<LockOffer_Cancel_Result> & {
  }
;


export declare type LockOffer_Reject_Result = {
  rejectedLockCid: damlTypes.ContractId<RejectedLock>;
};

export declare const LockOffer_Reject_Result:
  damlTypes.Serializable<LockOffer_Reject_Result> & {
  }
;


export declare type LockOffer_Accept_Result = {
  acceptedLockCid: damlTypes.ContractId<AcceptedLock>;
};

export declare const LockOffer_Accept_Result:
  damlTypes.Serializable<LockOffer_Accept_Result> & {
  }
;


export declare type ExecutedLock_Delete = {
};

export declare const ExecutedLock_Delete:
  damlTypes.Serializable<ExecutedLock_Delete> & {
  }
;


export declare type ExecutedLock_Clean = {
  actor: damlTypes.Party;
};

export declare const ExecutedLock_Clean:
  damlTypes.Serializable<ExecutedLock_Clean> & {
  }
;


export declare type ExecutedLock = {
  lock: Lock;
  holdingLabel: string;
};

export declare interface ExecutedLockInterface {
  ExecutedLock_Clean: damlTypes.Choice<ExecutedLock, ExecutedLock_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedLock, undefined>>;
  Archive: damlTypes.Choice<ExecutedLock, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedLock, undefined>>;
  ExecutedLock_Delete: damlTypes.Choice<ExecutedLock, ExecutedLock_Delete, ExecutedLock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedLock, undefined>>;
}
export declare const ExecutedLock:
  damlTypes.Template<ExecutedLock, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:ExecutedLock'> &
  damlTypes.ToInterface<ExecutedLock, never> &
  ExecutedLockInterface;

export declare namespace ExecutedLock {
}



export declare type FailedLock_Delete = {
};

export declare const FailedLock_Delete:
  damlTypes.Serializable<FailedLock_Delete> & {
  }
;


export declare type FailedLock_Clean = {
  actor: damlTypes.Party;
};

export declare const FailedLock_Clean:
  damlTypes.Serializable<FailedLock_Clean> & {
  }
;


export declare type FailedLock = {
  lock: Lock;
  reason: string;
};

export declare interface FailedLockInterface {
  FailedLock_Clean: damlTypes.Choice<FailedLock, FailedLock_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedLock, undefined>>;
  FailedLock_Delete: damlTypes.Choice<FailedLock, FailedLock_Delete, FailedLock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedLock, undefined>>;
  Archive: damlTypes.Choice<FailedLock, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedLock, undefined>>;
}
export declare const FailedLock:
  damlTypes.Template<FailedLock, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:FailedLock'> &
  damlTypes.ToInterface<FailedLock, never> &
  FailedLockInterface;

export declare namespace FailedLock {
}



export declare type RejectedLock_Delete = {
};

export declare const RejectedLock_Delete:
  damlTypes.Serializable<RejectedLock_Delete> & {
  }
;


export declare type RejectedLock_Clean = {
  actor: damlTypes.Party;
};

export declare const RejectedLock_Clean:
  damlTypes.Serializable<RejectedLock_Clean> & {
  }
;


export declare type RejectedLock = {
  lock: Lock;
  reason: string;
};

export declare interface RejectedLockInterface {
  RejectedLock_Clean: damlTypes.Choice<RejectedLock, RejectedLock_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedLock, undefined>>;
  RejectedLock_Delete: damlTypes.Choice<RejectedLock, RejectedLock_Delete, RejectedLock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedLock, undefined>>;
  Archive: damlTypes.Choice<RejectedLock, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedLock, undefined>>;
}
export declare const RejectedLock:
  damlTypes.Template<RejectedLock, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:RejectedLock'> &
  damlTypes.ToInterface<RejectedLock, never> &
  RejectedLockInterface;

export declare namespace RejectedLock {
}



export declare type AcceptedLock_Fail = {
  reason: string;
};

export declare const AcceptedLock_Fail:
  damlTypes.Serializable<AcceptedLock_Fail> & {
  }
;


export declare type AcceptedLock_Execute = {
  instrumentConfigurationCid: damlTypes.ContractId<Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration>;
  credentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
  holdingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
};

export declare const AcceptedLock_Execute:
  damlTypes.Serializable<AcceptedLock_Execute> & {
  }
;


export declare type AcceptedLock_Clean = {
  actor: damlTypes.Party;
};

export declare const AcceptedLock_Clean:
  damlTypes.Serializable<AcceptedLock_Clean> & {
  }
;


export declare type AcceptedLock = {
  lock: Lock;
  holdingLabel: string;
};

export declare interface AcceptedLockInterface {
  AcceptedLock_Clean: damlTypes.Choice<AcceptedLock, AcceptedLock_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedLock, undefined>>;
  AcceptedLock_Execute: damlTypes.Choice<AcceptedLock, AcceptedLock_Execute, AcceptedLock_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedLock, undefined>>;
  AcceptedLock_Fail: damlTypes.Choice<AcceptedLock, AcceptedLock_Fail, AcceptedLock_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedLock, undefined>>;
  Archive: damlTypes.Choice<AcceptedLock, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedLock, undefined>>;
}
export declare const AcceptedLock:
  damlTypes.Template<AcceptedLock, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:AcceptedLock'> &
  damlTypes.ToInterface<AcceptedLock, never> &
  AcceptedLockInterface;

export declare namespace AcceptedLock {
}



export declare type LockRequest_Cancel = {
};

export declare const LockRequest_Cancel:
  damlTypes.Serializable<LockRequest_Cancel> & {
  }
;


export declare type LockRequest_Reject = {
  reason: string;
};

export declare const LockRequest_Reject:
  damlTypes.Serializable<LockRequest_Reject> & {
  }
;


export declare type LockRequest_Accept = {
  holdingLabel: string;
};

export declare const LockRequest_Accept:
  damlTypes.Serializable<LockRequest_Accept> & {
  }
;


export declare type LockRequest_Clean = {
  actor: damlTypes.Party;
};

export declare const LockRequest_Clean:
  damlTypes.Serializable<LockRequest_Clean> & {
  }
;


export declare type LockRequest = {
  lock: Lock;
};

export declare interface LockRequestInterface {
  LockRequest_Clean: damlTypes.Choice<LockRequest, LockRequest_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockRequest, undefined>>;
  LockRequest_Accept: damlTypes.Choice<LockRequest, LockRequest_Accept, LockRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockRequest, undefined>>;
  LockRequest_Reject: damlTypes.Choice<LockRequest, LockRequest_Reject, LockRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockRequest, undefined>>;
  LockRequest_Cancel: damlTypes.Choice<LockRequest, LockRequest_Cancel, LockRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockRequest, undefined>>;
  Archive: damlTypes.Choice<LockRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockRequest, undefined>>;
}
export declare const LockRequest:
  damlTypes.Template<LockRequest, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:LockRequest'> &
  damlTypes.ToInterface<LockRequest, never> &
  LockRequestInterface;

export declare namespace LockRequest {
}



export declare type LockOffer_Cancel = {
};

export declare const LockOffer_Cancel:
  damlTypes.Serializable<LockOffer_Cancel> & {
  }
;


export declare type LockOffer_Reject = {
  reason: string;
};

export declare const LockOffer_Reject:
  damlTypes.Serializable<LockOffer_Reject> & {
  }
;


export declare type LockOffer_Accept = {
};

export declare const LockOffer_Accept:
  damlTypes.Serializable<LockOffer_Accept> & {
  }
;


export declare type LockOffer_Clean = {
  actor: damlTypes.Party;
};

export declare const LockOffer_Clean:
  damlTypes.Serializable<LockOffer_Clean> & {
  }
;


export declare type LockOffer = {
  lock: Lock;
  holdingLabel: string;
};

export declare interface LockOfferInterface {
  LockOffer_Clean: damlTypes.Choice<LockOffer, LockOffer_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockOffer, undefined>>;
  LockOffer_Accept: damlTypes.Choice<LockOffer, LockOffer_Accept, LockOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockOffer, undefined>>;
  LockOffer_Reject: damlTypes.Choice<LockOffer, LockOffer_Reject, LockOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockOffer, undefined>>;
  LockOffer_Cancel: damlTypes.Choice<LockOffer, LockOffer_Cancel, LockOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockOffer, undefined>>;
  Archive: damlTypes.Choice<LockOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<LockOffer, undefined>>;
}
export declare const LockOffer:
  damlTypes.Template<LockOffer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Lock:LockOffer'> &
  damlTypes.ToInterface<LockOffer, never> &
  LockOfferInterface;

export declare namespace LockOffer {
}



export declare type Lock = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  holder: damlTypes.Party;
  locker: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  context: string;
  reference: string;
  batch: Utility_Registry_V0_Types.Batch;
};

export declare const Lock:
  damlTypes.Serializable<Lock> & {
  }
;

