// Generated from Utility/Settlement/App/V1/Model/Dvp.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193 from '@daml.js/splice-api-token-allocation-request-v1-1.0.0';
import * as pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d from '@daml.js/splice-api-token-allocation-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Settlement_App_V1_Types from '../../../../../../Utility/Settlement/App/V1/Types/module';

export declare type RejectedDvp = {
  dvp: Dvp;
  reason: string;
  actor: damlTypes.Party;
};

export declare interface RejectedDvpInterface {
  Archive: damlTypes.Choice<RejectedDvp, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedDvp, undefined>>;
}
export declare const RejectedDvp:
  damlTypes.Template<RejectedDvp, undefined, '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:RejectedDvp'> &
  damlTypes.ToInterface<RejectedDvp, never> &
  RejectedDvpInterface;

export declare namespace RejectedDvp {
}



export declare type WithdrawnDvp = {
  dvp: Dvp;
  reason: string;
};

export declare interface WithdrawnDvpInterface {
  Archive: damlTypes.Choice<WithdrawnDvp, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<WithdrawnDvp, undefined>>;
}
export declare const WithdrawnDvp:
  damlTypes.Template<WithdrawnDvp, undefined, '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:WithdrawnDvp'> &
  damlTypes.ToInterface<WithdrawnDvp, never> &
  WithdrawnDvpInterface;

export declare namespace WithdrawnDvp {
}



export declare type SettledDvp = {
  dvp: Dvp;
};

export declare interface SettledDvpInterface {
  Archive: damlTypes.Choice<SettledDvp, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<SettledDvp, undefined>>;
}
export declare const SettledDvp:
  damlTypes.Template<SettledDvp, undefined, '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:SettledDvp'> &
  damlTypes.ToInterface<SettledDvp, never> &
  SettledDvpInterface;

export declare namespace SettledDvp {
}



export declare type RejectedDvpProposal = {
  dvpProposal: DvpProposal;
  reason: string;
};

export declare interface RejectedDvpProposalInterface {
  Archive: damlTypes.Choice<RejectedDvpProposal, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedDvpProposal, undefined>>;
}
export declare const RejectedDvpProposal:
  damlTypes.Template<RejectedDvpProposal, undefined, '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:RejectedDvpProposal'> &
  damlTypes.ToInterface<RejectedDvpProposal, never> &
  RejectedDvpProposalInterface;

export declare namespace RejectedDvpProposal {
}



export declare type DvpProposal_Reject_Result = {
  rejectedDvpProposalCid: damlTypes.Optional<damlTypes.ContractId<RejectedDvpProposal>>;
};

export declare const DvpProposal_Reject_Result:
  damlTypes.Serializable<DvpProposal_Reject_Result> & {
  }
;


export declare type DvpProposal_Cancel_Result = {
};

export declare const DvpProposal_Cancel_Result:
  damlTypes.Serializable<DvpProposal_Cancel_Result> & {
  }
;


export declare type DvpProposal_Accept_Result = {
  dvpCid: damlTypes.ContractId<Dvp>;
};

export declare const DvpProposal_Accept_Result:
  damlTypes.Serializable<DvpProposal_Accept_Result> & {
  }
;


export declare type DvpProposal_Reject = {
  reason: string;
};

export declare const DvpProposal_Reject:
  damlTypes.Serializable<DvpProposal_Reject> & {
  }
;


export declare type DvpProposal_Cancel = {
};

export declare const DvpProposal_Cancel:
  damlTypes.Serializable<DvpProposal_Cancel> & {
  }
;


export declare type DvpProposal_Accept = {
};

export declare const DvpProposal_Accept:
  damlTypes.Serializable<DvpProposal_Accept> & {
  }
;


export declare type DvpProposal = {
  operator: damlTypes.Party;
  proposer: damlTypes.Party;
  proposerIsBuyer: boolean;
  counterparty: damlTypes.Party;
  terms: Terms;
};

export declare interface DvpProposalInterface {
  Archive: damlTypes.Choice<DvpProposal, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DvpProposal, undefined>>;
  DvpProposal_Cancel: damlTypes.Choice<DvpProposal, DvpProposal_Cancel, DvpProposal_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DvpProposal, undefined>>;
  DvpProposal_Accept: damlTypes.Choice<DvpProposal, DvpProposal_Accept, DvpProposal_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DvpProposal, undefined>>;
  DvpProposal_Reject: damlTypes.Choice<DvpProposal, DvpProposal_Reject, DvpProposal_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DvpProposal, undefined>>;
}
export declare const DvpProposal:
  damlTypes.Template<DvpProposal, undefined, '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:DvpProposal'> &
  damlTypes.ToInterface<DvpProposal, never> &
  DvpProposalInterface;

export declare namespace DvpProposal {
}



export declare type Dvp_Cancel_Result = {
};

export declare const Dvp_Cancel_Result:
  damlTypes.Serializable<Dvp_Cancel_Result> & {
  }
;


export declare type Dvp_Settle_Result = {
  settledDvpCid: damlTypes.Optional<damlTypes.ContractId<SettledDvp>>;
};

export declare const Dvp_Settle_Result:
  damlTypes.Serializable<Dvp_Settle_Result> & {
  }
;


export declare type Dvp_Cancel = {
  allocationCids: damlTypes.ContractId<pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation>[];
  extraArgss: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs[];
  payload: pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest_Withdraw;
};

export declare const Dvp_Cancel:
  damlTypes.Serializable<Dvp_Cancel> & {
  }
;


export declare type Dvp_Settle = {
  allocationCids: damlTypes.ContractId<pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation>[];
  extraArgss: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs[];
};

export declare const Dvp_Settle:
  damlTypes.Serializable<Dvp_Settle> & {
  }
;


export declare type Dvp = {
  operator: damlTypes.Party;
  buyer: damlTypes.Party;
  seller: damlTypes.Party;
  terms: Terms;
};

export declare interface DvpInterface {
  Dvp_Settle: damlTypes.Choice<Dvp, Dvp_Settle, Dvp_Settle_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Dvp, undefined>>;
  Dvp_Cancel: damlTypes.Choice<Dvp, Dvp_Cancel, Dvp_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Dvp, undefined>>;
  Archive: damlTypes.Choice<Dvp, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Dvp, undefined>>;
}
export declare const Dvp:
  damlTypes.Template<Dvp, undefined, '#utility-settlement-app-v1:Utility.Settlement.App.V1.Model.Dvp:Dvp'> &
  damlTypes.ToInterface<Dvp, pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest> &
  DvpInterface;

export declare namespace Dvp {
}



export declare type Terms = {
  id: string;
  deliveries: Utility_Settlement_App_V1_Types.InstrumentQuantity[];
  payments: Utility_Settlement_App_V1_Types.InstrumentQuantity[];
  createdAt: damlTypes.Time;
  allocateBefore: damlTypes.Time;
  settleBefore: damlTypes.Time;
};

export declare const Terms:
  damlTypes.Serializable<Terms> & {
  }
;

