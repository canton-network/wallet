// Generated from Utility/Registry/V0/Holding/Burn.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Registry_V0_Configuration_Instrument from '../../../../../Utility/Registry/V0/Configuration/Instrument/module';
import * as Utility_Registry_V0_Types from '../../../../../Utility/Registry/V0/Types/module';

export declare type ExecutedBurn_Delete_Result = {
};

export declare const ExecutedBurn_Delete_Result:
  damlTypes.Serializable<ExecutedBurn_Delete_Result> & {
  }
;


export declare type RejectedBurn_Delete_Result = {
};

export declare const RejectedBurn_Delete_Result:
  damlTypes.Serializable<RejectedBurn_Delete_Result> & {
  }
;


export declare type FailedBurn_Delete_Result = {
};

export declare const FailedBurn_Delete_Result:
  damlTypes.Serializable<FailedBurn_Delete_Result> & {
  }
;


export declare type AcceptedBurn_Fail_Result = {
  failedBurnCid: damlTypes.ContractId<FailedBurn>;
};

export declare const AcceptedBurn_Fail_Result:
  damlTypes.Serializable<AcceptedBurn_Fail_Result> & {
  }
;


export declare type AcceptedBurn_Execute_Result = {
  executedBurnCid: damlTypes.ContractId<ExecutedBurn>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const AcceptedBurn_Execute_Result:
  damlTypes.Serializable<AcceptedBurn_Execute_Result> & {
  }
;


export declare type BurnRequest_Cancel_Result = {
};

export declare const BurnRequest_Cancel_Result:
  damlTypes.Serializable<BurnRequest_Cancel_Result> & {
  }
;


export declare type BurnRequest_Reject_Result = {
  rejectedBurnCid: damlTypes.ContractId<RejectedBurn>;
};

export declare const BurnRequest_Reject_Result:
  damlTypes.Serializable<BurnRequest_Reject_Result> & {
  }
;


export declare type BurnRequest_Accept_Result = {
  acceptedBurnCid: damlTypes.ContractId<AcceptedBurn>;
};

export declare const BurnRequest_Accept_Result:
  damlTypes.Serializable<BurnRequest_Accept_Result> & {
  }
;


export declare type BurnOffer_Cancel_Result = {
};

export declare const BurnOffer_Cancel_Result:
  damlTypes.Serializable<BurnOffer_Cancel_Result> & {
  }
;


export declare type BurnOffer_Reject_Result = {
  rejectedBurnCid: damlTypes.ContractId<RejectedBurn>;
};

export declare const BurnOffer_Reject_Result:
  damlTypes.Serializable<BurnOffer_Reject_Result> & {
  }
;


export declare type BurnOffer_Accept_Result = {
  acceptedBurnCid: damlTypes.ContractId<AcceptedBurn>;
};

export declare const BurnOffer_Accept_Result:
  damlTypes.Serializable<BurnOffer_Accept_Result> & {
  }
;


export declare type ExecutedBurn_Delete = {
};

export declare const ExecutedBurn_Delete:
  damlTypes.Serializable<ExecutedBurn_Delete> & {
  }
;


export declare type ExecutedBurn_Clean = {
  actor: damlTypes.Party;
};

export declare const ExecutedBurn_Clean:
  damlTypes.Serializable<ExecutedBurn_Clean> & {
  }
;


export declare type ExecutedBurn = {
  burn: Burn;
  holdingLabel: string;
};

export declare interface ExecutedBurnInterface {
  ExecutedBurn_Clean: damlTypes.Choice<ExecutedBurn, ExecutedBurn_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedBurn, undefined>>;
  Archive: damlTypes.Choice<ExecutedBurn, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedBurn, undefined>>;
  ExecutedBurn_Delete: damlTypes.Choice<ExecutedBurn, ExecutedBurn_Delete, ExecutedBurn_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedBurn, undefined>>;
}
export declare const ExecutedBurn:
  damlTypes.Template<ExecutedBurn, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:ExecutedBurn'> &
  damlTypes.ToInterface<ExecutedBurn, never> &
  ExecutedBurnInterface;

export declare namespace ExecutedBurn {
}



export declare type FailedBurn_Delete = {
};

export declare const FailedBurn_Delete:
  damlTypes.Serializable<FailedBurn_Delete> & {
  }
;


export declare type FailedBurn_Clean = {
  actor: damlTypes.Party;
};

export declare const FailedBurn_Clean:
  damlTypes.Serializable<FailedBurn_Clean> & {
  }
;


export declare type FailedBurn = {
  burn: Burn;
  reason: string;
};

export declare interface FailedBurnInterface {
  FailedBurn_Clean: damlTypes.Choice<FailedBurn, FailedBurn_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedBurn, undefined>>;
  FailedBurn_Delete: damlTypes.Choice<FailedBurn, FailedBurn_Delete, FailedBurn_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedBurn, undefined>>;
  Archive: damlTypes.Choice<FailedBurn, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedBurn, undefined>>;
}
export declare const FailedBurn:
  damlTypes.Template<FailedBurn, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:FailedBurn'> &
  damlTypes.ToInterface<FailedBurn, never> &
  FailedBurnInterface;

export declare namespace FailedBurn {
}



export declare type RejectedBurn_Delete = {
};

export declare const RejectedBurn_Delete:
  damlTypes.Serializable<RejectedBurn_Delete> & {
  }
;


export declare type RejectedBurn_Clean = {
  actor: damlTypes.Party;
};

export declare const RejectedBurn_Clean:
  damlTypes.Serializable<RejectedBurn_Clean> & {
  }
;


export declare type RejectedBurn = {
  burn: Burn;
  reason: string;
};

export declare interface RejectedBurnInterface {
  RejectedBurn_Clean: damlTypes.Choice<RejectedBurn, RejectedBurn_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedBurn, undefined>>;
  RejectedBurn_Delete: damlTypes.Choice<RejectedBurn, RejectedBurn_Delete, RejectedBurn_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedBurn, undefined>>;
  Archive: damlTypes.Choice<RejectedBurn, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedBurn, undefined>>;
}
export declare const RejectedBurn:
  damlTypes.Template<RejectedBurn, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:RejectedBurn'> &
  damlTypes.ToInterface<RejectedBurn, never> &
  RejectedBurnInterface;

export declare namespace RejectedBurn {
}



export declare type AcceptedBurn_Fail = {
  reason: string;
};

export declare const AcceptedBurn_Fail:
  damlTypes.Serializable<AcceptedBurn_Fail> & {
  }
;


export declare type AcceptedBurn_Execute = {
  instrumentConfigurationCid: damlTypes.ContractId<Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration>;
  credentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
  holdingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
};

export declare const AcceptedBurn_Execute:
  damlTypes.Serializable<AcceptedBurn_Execute> & {
  }
;


export declare type AcceptedBurn_Clean = {
  actor: damlTypes.Party;
};

export declare const AcceptedBurn_Clean:
  damlTypes.Serializable<AcceptedBurn_Clean> & {
  }
;


export declare type AcceptedBurn = {
  burn: Burn;
  holdingLabel: string;
};

export declare interface AcceptedBurnInterface {
  AcceptedBurn_Clean: damlTypes.Choice<AcceptedBurn, AcceptedBurn_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedBurn, undefined>>;
  AcceptedBurn_Execute: damlTypes.Choice<AcceptedBurn, AcceptedBurn_Execute, AcceptedBurn_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedBurn, undefined>>;
  AcceptedBurn_Fail: damlTypes.Choice<AcceptedBurn, AcceptedBurn_Fail, AcceptedBurn_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedBurn, undefined>>;
  Archive: damlTypes.Choice<AcceptedBurn, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedBurn, undefined>>;
}
export declare const AcceptedBurn:
  damlTypes.Template<AcceptedBurn, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:AcceptedBurn'> &
  damlTypes.ToInterface<AcceptedBurn, never> &
  AcceptedBurnInterface;

export declare namespace AcceptedBurn {
}



export declare type BurnRequest_Cancel = {
};

export declare const BurnRequest_Cancel:
  damlTypes.Serializable<BurnRequest_Cancel> & {
  }
;


export declare type BurnRequest_Reject = {
  reason: string;
};

export declare const BurnRequest_Reject:
  damlTypes.Serializable<BurnRequest_Reject> & {
  }
;


export declare type BurnRequest_Accept = {
};

export declare const BurnRequest_Accept:
  damlTypes.Serializable<BurnRequest_Accept> & {
  }
;


export declare type BurnRequest_Clean = {
  actor: damlTypes.Party;
};

export declare const BurnRequest_Clean:
  damlTypes.Serializable<BurnRequest_Clean> & {
  }
;


export declare type BurnRequest = {
  burn: Burn;
  holdingLabel: string;
};

export declare interface BurnRequestInterface {
  BurnRequest_Clean: damlTypes.Choice<BurnRequest, BurnRequest_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnRequest, undefined>>;
  BurnRequest_Accept: damlTypes.Choice<BurnRequest, BurnRequest_Accept, BurnRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnRequest, undefined>>;
  BurnRequest_Reject: damlTypes.Choice<BurnRequest, BurnRequest_Reject, BurnRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnRequest, undefined>>;
  BurnRequest_Cancel: damlTypes.Choice<BurnRequest, BurnRequest_Cancel, BurnRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnRequest, undefined>>;
  Archive: damlTypes.Choice<BurnRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnRequest, undefined>>;
}
export declare const BurnRequest:
  damlTypes.Template<BurnRequest, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:BurnRequest'> &
  damlTypes.ToInterface<BurnRequest, never> &
  BurnRequestInterface;

export declare namespace BurnRequest {
}



export declare type BurnOffer_Cancel = {
};

export declare const BurnOffer_Cancel:
  damlTypes.Serializable<BurnOffer_Cancel> & {
  }
;


export declare type BurnOffer_Reject = {
  reason: string;
};

export declare const BurnOffer_Reject:
  damlTypes.Serializable<BurnOffer_Reject> & {
  }
;


export declare type BurnOffer_Accept = {
  holdingLabel: string;
};

export declare const BurnOffer_Accept:
  damlTypes.Serializable<BurnOffer_Accept> & {
  }
;


export declare type BurnOffer_Clean = {
  actor: damlTypes.Party;
};

export declare const BurnOffer_Clean:
  damlTypes.Serializable<BurnOffer_Clean> & {
  }
;


export declare type BurnOffer = {
  burn: Burn;
};

export declare interface BurnOfferInterface {
  BurnOffer_Clean: damlTypes.Choice<BurnOffer, BurnOffer_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnOffer, undefined>>;
  BurnOffer_Accept: damlTypes.Choice<BurnOffer, BurnOffer_Accept, BurnOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnOffer, undefined>>;
  BurnOffer_Reject: damlTypes.Choice<BurnOffer, BurnOffer_Reject, BurnOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnOffer, undefined>>;
  BurnOffer_Cancel: damlTypes.Choice<BurnOffer, BurnOffer_Cancel, BurnOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnOffer, undefined>>;
  Archive: damlTypes.Choice<BurnOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnOffer, undefined>>;
}
export declare const BurnOffer:
  damlTypes.Template<BurnOffer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:BurnOffer'> &
  damlTypes.ToInterface<BurnOffer, never> &
  BurnOfferInterface;

export declare namespace BurnOffer {
}



export declare type Burn = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  holder: damlTypes.Party;
  reference: string;
  batch: Utility_Registry_V0_Types.Batch;
};

export declare const Burn:
  damlTypes.Serializable<Burn> & {
  }
;

