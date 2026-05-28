// Generated from Utility/Registry/App/V0/Model/Burn.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b from '@daml.js/splice-api-token-holding-v1-1.0.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type ExecutedBurn_Delete_Result = {
};

export declare const ExecutedBurn_Delete_Result:
  damlTypes.Serializable<ExecutedBurn_Delete_Result> & {
  }
;


export declare type ExecutedBurn_Delete = {
  actor: damlTypes.Party;
};

export declare const ExecutedBurn_Delete:
  damlTypes.Serializable<ExecutedBurn_Delete> & {
  }
;


export declare type ExecutedBurn = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  burn: Burn;
  operatorIsObserver: damlTypes.Optional<boolean>;
};

export declare interface ExecutedBurnInterface {
  ExecutedBurn_Delete: damlTypes.Choice<ExecutedBurn, ExecutedBurn_Delete, ExecutedBurn_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedBurn, undefined>>;
  Archive: damlTypes.Choice<ExecutedBurn, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedBurn, undefined>>;
}
export declare const ExecutedBurn:
  damlTypes.Template<ExecutedBurn, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Burn:ExecutedBurn'> &
  damlTypes.ToInterface<ExecutedBurn, never> &
  ExecutedBurnInterface;

export declare namespace ExecutedBurn {
}



export declare type RejectedBurn_Delete_Result = {
};

export declare const RejectedBurn_Delete_Result:
  damlTypes.Serializable<RejectedBurn_Delete_Result> & {
  }
;


export declare type RejectedBurn_Delete = {
  actor: damlTypes.Party;
};

export declare const RejectedBurn_Delete:
  damlTypes.Serializable<RejectedBurn_Delete> & {
  }
;


export declare type RejectedBurn = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  burn: Burn;
  reason: string;
  operatorIsObserver: damlTypes.Optional<boolean>;
};

export declare interface RejectedBurnInterface {
  RejectedBurn_Delete: damlTypes.Choice<RejectedBurn, RejectedBurn_Delete, RejectedBurn_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedBurn, undefined>>;
  Archive: damlTypes.Choice<RejectedBurn, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedBurn, undefined>>;
}
export declare const RejectedBurn:
  damlTypes.Template<RejectedBurn, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Burn:RejectedBurn'> &
  damlTypes.ToInterface<RejectedBurn, never> &
  RejectedBurnInterface;

export declare namespace RejectedBurn {
}



export declare type BurnOffer_Cancel_Result = {
};

export declare const BurnOffer_Cancel_Result:
  damlTypes.Serializable<BurnOffer_Cancel_Result> & {
  }
;


export declare type BurnOffer_Reject_Result = {
  rejectedBurnCid: damlTypes.Optional<damlTypes.ContractId<RejectedBurn>>;
};

export declare const BurnOffer_Reject_Result:
  damlTypes.Serializable<BurnOffer_Reject_Result> & {
  }
;


export declare type BurnOffer_Accept_Result = {
  executedBurnCid: damlTypes.Optional<damlTypes.ContractId<ExecutedBurn>>;
  remaining: damlTypes.Optional<damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>>;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const BurnOffer_Accept_Result:
  damlTypes.Serializable<BurnOffer_Accept_Result> & {
  }
;


export declare type BurnOffer_Cancel = {
};

export declare const BurnOffer_Cancel:
  damlTypes.Serializable<BurnOffer_Cancel> & {
  }
;


export declare type BurnOffer_Reject = {
  reason: string;
  extraArgs: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs>;
};

export declare const BurnOffer_Reject:
  damlTypes.Serializable<BurnOffer_Reject> & {
  }
;


export declare type BurnOffer_Accept = {
  holdingCids: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>[];
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const BurnOffer_Accept:
  damlTypes.Serializable<BurnOffer_Accept> & {
  }
;


export declare type BurnOffer = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  burn: Burn;
};

export declare interface BurnOfferInterface {
  BurnOffer_Accept: damlTypes.Choice<BurnOffer, BurnOffer_Accept, BurnOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnOffer, undefined>>;
  BurnOffer_Reject: damlTypes.Choice<BurnOffer, BurnOffer_Reject, BurnOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnOffer, undefined>>;
  BurnOffer_Cancel: damlTypes.Choice<BurnOffer, BurnOffer_Cancel, BurnOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnOffer, undefined>>;
  Archive: damlTypes.Choice<BurnOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnOffer, undefined>>;
}
export declare const BurnOffer:
  damlTypes.Template<BurnOffer, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Burn:BurnOffer'> &
  damlTypes.ToInterface<BurnOffer, never> &
  BurnOfferInterface;

export declare namespace BurnOffer {
}



export declare type BurnRequest_Accept_Result = {
  executedBurnCid: damlTypes.Optional<damlTypes.ContractId<ExecutedBurn>>;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const BurnRequest_Accept_Result:
  damlTypes.Serializable<BurnRequest_Accept_Result> & {
  }
;


export declare type BurnRequest_Cancel_Result = {
  holdingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
};

export declare const BurnRequest_Cancel_Result:
  damlTypes.Serializable<BurnRequest_Cancel_Result> & {
  }
;


export declare type BurnRequest_Reject_Result = {
  rejectedBurnCid: damlTypes.Optional<damlTypes.ContractId<RejectedBurn>>;
  holdingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
};

export declare const BurnRequest_Reject_Result:
  damlTypes.Serializable<BurnRequest_Reject_Result> & {
  }
;


export declare type BurnRequest_Cancel = {
};

export declare const BurnRequest_Cancel:
  damlTypes.Serializable<BurnRequest_Cancel> & {
  }
;


export declare type BurnRequest_Reject = {
  reason: string;
  extraArgs: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs>;
};

export declare const BurnRequest_Reject:
  damlTypes.Serializable<BurnRequest_Reject> & {
  }
;


export declare type BurnRequest_Accept = {
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const BurnRequest_Accept:
  damlTypes.Serializable<BurnRequest_Accept> & {
  }
;


export declare type BurnRequest = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  burn: Burn;
  lockedHoldingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
};

export declare interface BurnRequestInterface {
  BurnRequest_Accept: damlTypes.Choice<BurnRequest, BurnRequest_Accept, BurnRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnRequest, undefined>>;
  BurnRequest_Reject: damlTypes.Choice<BurnRequest, BurnRequest_Reject, BurnRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnRequest, undefined>>;
  BurnRequest_Cancel: damlTypes.Choice<BurnRequest, BurnRequest_Cancel, BurnRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnRequest, undefined>>;
  Archive: damlTypes.Choice<BurnRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<BurnRequest, undefined>>;
}
export declare const BurnRequest:
  damlTypes.Template<BurnRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Burn:BurnRequest'> &
  damlTypes.ToInterface<BurnRequest, never> &
  BurnRequestInterface;

export declare namespace BurnRequest {
}



export declare type Burn = {
  instrumentId: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId;
  amount: damlTypes.Numeric;
  holder: damlTypes.Party;
  reference: string;
  requestedAt: damlTypes.Time;
  executeBefore: damlTypes.Time;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const Burn:
  damlTypes.Serializable<Burn> & {
  }
;

