// Generated from Utility/Registry/V0/Holding/Unlock.daml
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

export declare type ExecutedUnlock_Delete_Result = {
};

export declare const ExecutedUnlock_Delete_Result:
  damlTypes.Serializable<ExecutedUnlock_Delete_Result> & {
  }
;


export declare type RejectedUnlock_Delete_Result = {
};

export declare const RejectedUnlock_Delete_Result:
  damlTypes.Serializable<RejectedUnlock_Delete_Result> & {
  }
;


export declare type FailedUnlock_Delete_Result = {
};

export declare const FailedUnlock_Delete_Result:
  damlTypes.Serializable<FailedUnlock_Delete_Result> & {
  }
;


export declare type AcceptedUnlock_Fail_Result = {
  failedUnlockCid: damlTypes.ContractId<FailedUnlock>;
};

export declare const AcceptedUnlock_Fail_Result:
  damlTypes.Serializable<AcceptedUnlock_Fail_Result> & {
  }
;


export declare type AcceptedUnlock_Execute_Result = {
  holdingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  remainingCids: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>[];
  executedUnlockCid: damlTypes.ContractId<ExecutedUnlock>;
};

export declare const AcceptedUnlock_Execute_Result:
  damlTypes.Serializable<AcceptedUnlock_Execute_Result> & {
  }
;


export declare type UnlockRequest_Cancel_Result = {
};

export declare const UnlockRequest_Cancel_Result:
  damlTypes.Serializable<UnlockRequest_Cancel_Result> & {
  }
;


export declare type UnlockRequest_Reject_Result = {
  rejectedUnlockCid: damlTypes.ContractId<RejectedUnlock>;
};

export declare const UnlockRequest_Reject_Result:
  damlTypes.Serializable<UnlockRequest_Reject_Result> & {
  }
;


export declare type UnlockRequest_Accept_Result = {
  acceptedUnlockCid: damlTypes.ContractId<AcceptedUnlock>;
};

export declare const UnlockRequest_Accept_Result:
  damlTypes.Serializable<UnlockRequest_Accept_Result> & {
  }
;


export declare type UnlockOffer_Cancel_Result = {
};

export declare const UnlockOffer_Cancel_Result:
  damlTypes.Serializable<UnlockOffer_Cancel_Result> & {
  }
;


export declare type UnlockOffer_Reject_Result = {
  rejectedUnlockCid: damlTypes.ContractId<RejectedUnlock>;
};

export declare const UnlockOffer_Reject_Result:
  damlTypes.Serializable<UnlockOffer_Reject_Result> & {
  }
;


export declare type UnlockOffer_Accept_Result = {
  acceptedUnlockCid: damlTypes.ContractId<AcceptedUnlock>;
};

export declare const UnlockOffer_Accept_Result:
  damlTypes.Serializable<UnlockOffer_Accept_Result> & {
  }
;


export declare type ExecutedUnlock_Delete = {
};

export declare const ExecutedUnlock_Delete:
  damlTypes.Serializable<ExecutedUnlock_Delete> & {
  }
;


export declare type ExecutedUnlock_Clean = {
  actor: damlTypes.Party;
};

export declare const ExecutedUnlock_Clean:
  damlTypes.Serializable<ExecutedUnlock_Clean> & {
  }
;


export declare type ExecutedUnlock = {
  unlock: Unlock;
  holdingLabel: string;
};

export declare interface ExecutedUnlockInterface {
  ExecutedUnlock_Clean: damlTypes.Choice<ExecutedUnlock, ExecutedUnlock_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedUnlock, undefined>>;
  Archive: damlTypes.Choice<ExecutedUnlock, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedUnlock, undefined>>;
  ExecutedUnlock_Delete: damlTypes.Choice<ExecutedUnlock, ExecutedUnlock_Delete, ExecutedUnlock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedUnlock, undefined>>;
}
export declare const ExecutedUnlock:
  damlTypes.Template<ExecutedUnlock, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:ExecutedUnlock'> &
  damlTypes.ToInterface<ExecutedUnlock, never> &
  ExecutedUnlockInterface;

export declare namespace ExecutedUnlock {
}



export declare type FailedUnlock_Delete = {
};

export declare const FailedUnlock_Delete:
  damlTypes.Serializable<FailedUnlock_Delete> & {
  }
;


export declare type FailedUnlock_Clean = {
  actor: damlTypes.Party;
};

export declare const FailedUnlock_Clean:
  damlTypes.Serializable<FailedUnlock_Clean> & {
  }
;


export declare type FailedUnlock = {
  unlock: Unlock;
  reason: string;
};

export declare interface FailedUnlockInterface {
  FailedUnlock_Clean: damlTypes.Choice<FailedUnlock, FailedUnlock_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedUnlock, undefined>>;
  FailedUnlock_Delete: damlTypes.Choice<FailedUnlock, FailedUnlock_Delete, FailedUnlock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedUnlock, undefined>>;
  Archive: damlTypes.Choice<FailedUnlock, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedUnlock, undefined>>;
}
export declare const FailedUnlock:
  damlTypes.Template<FailedUnlock, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:FailedUnlock'> &
  damlTypes.ToInterface<FailedUnlock, never> &
  FailedUnlockInterface;

export declare namespace FailedUnlock {
}



export declare type RejectedUnlock_Delete = {
};

export declare const RejectedUnlock_Delete:
  damlTypes.Serializable<RejectedUnlock_Delete> & {
  }
;


export declare type RejectedUnlock_Clean = {
  actor: damlTypes.Party;
};

export declare const RejectedUnlock_Clean:
  damlTypes.Serializable<RejectedUnlock_Clean> & {
  }
;


export declare type RejectedUnlock = {
  unlock: Unlock;
  reason: string;
};

export declare interface RejectedUnlockInterface {
  RejectedUnlock_Clean: damlTypes.Choice<RejectedUnlock, RejectedUnlock_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedUnlock, undefined>>;
  RejectedUnlock_Delete: damlTypes.Choice<RejectedUnlock, RejectedUnlock_Delete, RejectedUnlock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedUnlock, undefined>>;
  Archive: damlTypes.Choice<RejectedUnlock, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedUnlock, undefined>>;
}
export declare const RejectedUnlock:
  damlTypes.Template<RejectedUnlock, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:RejectedUnlock'> &
  damlTypes.ToInterface<RejectedUnlock, never> &
  RejectedUnlockInterface;

export declare namespace RejectedUnlock {
}



export declare type AcceptedUnlock_Fail = {
  reason: string;
};

export declare const AcceptedUnlock_Fail:
  damlTypes.Serializable<AcceptedUnlock_Fail> & {
  }
;


export declare type AcceptedUnlock_Execute = {
  instrumentConfigurationCid: damlTypes.ContractId<Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration>;
  credentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
  holdingCids: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>[];
};

export declare const AcceptedUnlock_Execute:
  damlTypes.Serializable<AcceptedUnlock_Execute> & {
  }
;


export declare type AcceptedUnlock_Clean = {
  actor: damlTypes.Party;
};

export declare const AcceptedUnlock_Clean:
  damlTypes.Serializable<AcceptedUnlock_Clean> & {
  }
;


export declare type AcceptedUnlock = {
  unlock: Unlock;
  holdingLabel: string;
};

export declare interface AcceptedUnlockInterface {
  AcceptedUnlock_Clean: damlTypes.Choice<AcceptedUnlock, AcceptedUnlock_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedUnlock, undefined>>;
  AcceptedUnlock_Execute: damlTypes.Choice<AcceptedUnlock, AcceptedUnlock_Execute, AcceptedUnlock_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedUnlock, undefined>>;
  AcceptedUnlock_Fail: damlTypes.Choice<AcceptedUnlock, AcceptedUnlock_Fail, AcceptedUnlock_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedUnlock, undefined>>;
  Archive: damlTypes.Choice<AcceptedUnlock, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedUnlock, undefined>>;
}
export declare const AcceptedUnlock:
  damlTypes.Template<AcceptedUnlock, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:AcceptedUnlock'> &
  damlTypes.ToInterface<AcceptedUnlock, never> &
  AcceptedUnlockInterface;

export declare namespace AcceptedUnlock {
}



export declare type UnlockRequest_Cancel = {
};

export declare const UnlockRequest_Cancel:
  damlTypes.Serializable<UnlockRequest_Cancel> & {
  }
;


export declare type UnlockRequest_Reject = {
  reason: string;
};

export declare const UnlockRequest_Reject:
  damlTypes.Serializable<UnlockRequest_Reject> & {
  }
;


export declare type UnlockRequest_Accept = {
  holdingLabel: string;
};

export declare const UnlockRequest_Accept:
  damlTypes.Serializable<UnlockRequest_Accept> & {
  }
;


export declare type UnlockRequest_Clean = {
  actor: damlTypes.Party;
};

export declare const UnlockRequest_Clean:
  damlTypes.Serializable<UnlockRequest_Clean> & {
  }
;


export declare type UnlockRequest = {
  unlock: Unlock;
};

export declare interface UnlockRequestInterface {
  UnlockRequest_Clean: damlTypes.Choice<UnlockRequest, UnlockRequest_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockRequest, undefined>>;
  UnlockRequest_Accept: damlTypes.Choice<UnlockRequest, UnlockRequest_Accept, UnlockRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockRequest, undefined>>;
  UnlockRequest_Reject: damlTypes.Choice<UnlockRequest, UnlockRequest_Reject, UnlockRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockRequest, undefined>>;
  UnlockRequest_Cancel: damlTypes.Choice<UnlockRequest, UnlockRequest_Cancel, UnlockRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockRequest, undefined>>;
  Archive: damlTypes.Choice<UnlockRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockRequest, undefined>>;
}
export declare const UnlockRequest:
  damlTypes.Template<UnlockRequest, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:UnlockRequest'> &
  damlTypes.ToInterface<UnlockRequest, never> &
  UnlockRequestInterface;

export declare namespace UnlockRequest {
}



export declare type UnlockOffer_Cancel = {
};

export declare const UnlockOffer_Cancel:
  damlTypes.Serializable<UnlockOffer_Cancel> & {
  }
;


export declare type UnlockOffer_Reject = {
  reason: string;
};

export declare const UnlockOffer_Reject:
  damlTypes.Serializable<UnlockOffer_Reject> & {
  }
;


export declare type UnlockOffer_Accept = {
};

export declare const UnlockOffer_Accept:
  damlTypes.Serializable<UnlockOffer_Accept> & {
  }
;


export declare type UnlockOffer_Clean = {
  actor: damlTypes.Party;
};

export declare const UnlockOffer_Clean:
  damlTypes.Serializable<UnlockOffer_Clean> & {
  }
;


export declare type UnlockOffer = {
  unlock: Unlock;
  holdingLabel: string;
};

export declare interface UnlockOfferInterface {
  UnlockOffer_Clean: damlTypes.Choice<UnlockOffer, UnlockOffer_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockOffer, undefined>>;
  UnlockOffer_Accept: damlTypes.Choice<UnlockOffer, UnlockOffer_Accept, UnlockOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockOffer, undefined>>;
  UnlockOffer_Reject: damlTypes.Choice<UnlockOffer, UnlockOffer_Reject, UnlockOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockOffer, undefined>>;
  UnlockOffer_Cancel: damlTypes.Choice<UnlockOffer, UnlockOffer_Cancel, UnlockOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockOffer, undefined>>;
  Archive: damlTypes.Choice<UnlockOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UnlockOffer, undefined>>;
}
export declare const UnlockOffer:
  damlTypes.Template<UnlockOffer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Unlock:UnlockOffer'> &
  damlTypes.ToInterface<UnlockOffer, never> &
  UnlockOfferInterface;

export declare namespace UnlockOffer {
}



export declare type Unlock = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  holder: damlTypes.Party;
  locker: damlTypes.Party;
  lockContext: string;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  reference: string;
  batch: Utility_Registry_V0_Types.Batch;
};

export declare const Unlock:
  damlTypes.Serializable<Unlock> & {
  }
;

