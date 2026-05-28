// Generated from Utility/Collateral/App/Model/Collateral.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193 from '@daml.js/splice-api-token-allocation-request-v1-1.0.0';
import * as pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d from '@daml.js/splice-api-token-allocation-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Collateral_App_Model_State from '../../../../../Utility/Collateral/App/Model/State/module';
import * as Utility_Collateral_App_Types from '../../../../../Utility/Collateral/App/Types/module';

export declare type ExpectedCollateralState = {
  operator: damlTypes.Party;
  partyA: damlTypes.Party;
  partyB: damlTypes.Party;
  id: string;
};

export declare const ExpectedCollateralState:
  damlTypes.Serializable<ExpectedCollateralState> & {
  }
;


export declare type FailedCollateralTransfer = {
  partyA: damlTypes.Party;
  partyB: damlTypes.Party;
  operator: damlTypes.Party;
  agreementId: string;
  id: string;
  failedPledges: Utility_Collateral_App_Types.InstrumentQuantity[];
};

export declare interface FailedCollateralTransferInterface {
  Archive: damlTypes.Choice<FailedCollateralTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedCollateralTransfer, undefined>>;
}
export declare const FailedCollateralTransfer:
  damlTypes.Template<FailedCollateralTransfer, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:FailedCollateralTransfer'> &
  damlTypes.ToInterface<FailedCollateralTransfer, never> &
  FailedCollateralTransferInterface;

export declare namespace FailedCollateralTransfer {
}



export declare type ExecutedCollateralTransfer = {
  partyA: damlTypes.Party;
  partyB: damlTypes.Party;
  operator: damlTypes.Party;
  agreementId: string;
  id: string;
  settledPositions: Utility_Collateral_App_Types.CollateralPosition[];
};

export declare interface ExecutedCollateralTransferInterface {
  Archive: damlTypes.Choice<ExecutedCollateralTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedCollateralTransfer, undefined>>;
}
export declare const ExecutedCollateralTransfer:
  damlTypes.Template<ExecutedCollateralTransfer, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:ExecutedCollateralTransfer'> &
  damlTypes.ToInterface<ExecutedCollateralTransfer, never> &
  ExecutedCollateralTransferInterface;

export declare namespace ExecutedCollateralTransfer {
}



export declare type InstructedCollateral_Cancel_Result = {
};

export declare const InstructedCollateral_Cancel_Result:
  damlTypes.Serializable<InstructedCollateral_Cancel_Result> & {
  }
;


export declare type InstructedCollateral_ExecuteTransfer_Result = {
  collateralStateCid: damlTypes.ContractId<Utility_Collateral_App_Model_State.CollateralState>;
};

export declare const InstructedCollateral_ExecuteTransfer_Result:
  damlTypes.Serializable<InstructedCollateral_ExecuteTransfer_Result> & {
  }
;


export declare type InstructedCollateral_ExecuteTransfer = {
  actor: damlTypes.Party;
  allocations: damlTypes.ContractId<pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation>[];
  executeTransferArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs[];
  collateralStateCid: damlTypes.ContractId<Utility_Collateral_App_Model_State.CollateralState>;
};

export declare const InstructedCollateral_ExecuteTransfer:
  damlTypes.Serializable<InstructedCollateral_ExecuteTransfer> & {
  }
;


export declare type InstructedCollateral_Cancel = {
  actor: damlTypes.Party;
  allocations: damlTypes.ContractId<pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation>[];
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs[];
};

export declare const InstructedCollateral_Cancel:
  damlTypes.Serializable<InstructedCollateral_Cancel> & {
  }
;


export declare type InstructedCollateral = {
  partyA: damlTypes.Party;
  partyB: damlTypes.Party;
  operator: damlTypes.Party;
  agreementId: string;
  id: string;
  instructedPositions: Utility_Collateral_App_Types.CollateralPosition[];
  createdAt: damlTypes.Time;
  allocateBefore: damlTypes.Time;
  settleBefore: damlTypes.Time;
};

export declare interface InstructedCollateralInterface {
  InstructedCollateral_ExecuteTransfer: damlTypes.Choice<InstructedCollateral, InstructedCollateral_ExecuteTransfer, InstructedCollateral_ExecuteTransfer_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InstructedCollateral, undefined>>;
  InstructedCollateral_Cancel: damlTypes.Choice<InstructedCollateral, InstructedCollateral_Cancel, InstructedCollateral_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InstructedCollateral, undefined>>;
  Archive: damlTypes.Choice<InstructedCollateral, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InstructedCollateral, undefined>>;
}
export declare const InstructedCollateral:
  damlTypes.Template<InstructedCollateral, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:InstructedCollateral'> &
  damlTypes.ToInterface<InstructedCollateral, pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest> &
  InstructedCollateralInterface;

export declare namespace InstructedCollateral {
}



export declare type CollateralAgreementChangeRequest_Cancel_Result = {
};

export declare const CollateralAgreementChangeRequest_Cancel_Result:
  damlTypes.Serializable<CollateralAgreementChangeRequest_Cancel_Result> & {
  }
;


export declare type CollateralAgreementChangeRequest_Reject_Result = {
  reason: string;
};

export declare const CollateralAgreementChangeRequest_Reject_Result:
  damlTypes.Serializable<CollateralAgreementChangeRequest_Reject_Result> & {
  }
;


export declare type CollateralAgreementChangeRequest_Accept_Result = {
  collateralAgreementCid: damlTypes.ContractId<CollateralAgreement>;
};

export declare const CollateralAgreementChangeRequest_Accept_Result:
  damlTypes.Serializable<CollateralAgreementChangeRequest_Accept_Result> & {
  }
;


export declare type CollateralAgreementChangeRequest_Cancel = {
};

export declare const CollateralAgreementChangeRequest_Cancel:
  damlTypes.Serializable<CollateralAgreementChangeRequest_Cancel> & {
  }
;


export declare type CollateralAgreementChangeRequest_Reject = {
  reason: string;
};

export declare const CollateralAgreementChangeRequest_Reject:
  damlTypes.Serializable<CollateralAgreementChangeRequest_Reject> & {
  }
;


export declare type CollateralAgreementChangeRequest_Accept = {
};

export declare const CollateralAgreementChangeRequest_Accept:
  damlTypes.Serializable<CollateralAgreementChangeRequest_Accept> & {
  }
;


export declare type CollateralAgreementChangeRequest = {
  operator: damlTypes.Party;
  requestor: damlTypes.Party;
  counterparty: damlTypes.Party;
  id: string;
  terms: Utility_Collateral_App_Types.Terms;
  collateralAgreementCid: damlTypes.ContractId<CollateralAgreement>;
};

export declare interface CollateralAgreementChangeRequestInterface {
  CollateralAgreementChangeRequest_Accept: damlTypes.Choice<CollateralAgreementChangeRequest, CollateralAgreementChangeRequest_Accept, CollateralAgreementChangeRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreementChangeRequest, undefined>>;
  Archive: damlTypes.Choice<CollateralAgreementChangeRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreementChangeRequest, undefined>>;
  CollateralAgreementChangeRequest_Reject: damlTypes.Choice<CollateralAgreementChangeRequest, CollateralAgreementChangeRequest_Reject, CollateralAgreementChangeRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreementChangeRequest, undefined>>;
  CollateralAgreementChangeRequest_Cancel: damlTypes.Choice<CollateralAgreementChangeRequest, CollateralAgreementChangeRequest_Cancel, CollateralAgreementChangeRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreementChangeRequest, undefined>>;
}
export declare const CollateralAgreementChangeRequest:
  damlTypes.Template<CollateralAgreementChangeRequest, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:CollateralAgreementChangeRequest'> &
  damlTypes.ToInterface<CollateralAgreementChangeRequest, never> &
  CollateralAgreementChangeRequestInterface;

export declare namespace CollateralAgreementChangeRequest {
}



export declare type CollateralAgreementRequest_Cancel_Result = {
};

export declare const CollateralAgreementRequest_Cancel_Result:
  damlTypes.Serializable<CollateralAgreementRequest_Cancel_Result> & {
  }
;


export declare type CollateralAgreementRequest_Reject_Result = {
  reason: string;
};

export declare const CollateralAgreementRequest_Reject_Result:
  damlTypes.Serializable<CollateralAgreementRequest_Reject_Result> & {
  }
;


export declare type CollateralAgreementRequest_Accept_Result = {
  collateralAgreementCid: damlTypes.ContractId<CollateralAgreement>;
  collateralStateCid: damlTypes.ContractId<Utility_Collateral_App_Model_State.CollateralState>;
};

export declare const CollateralAgreementRequest_Accept_Result:
  damlTypes.Serializable<CollateralAgreementRequest_Accept_Result> & {
  }
;


export declare type CollateralAgreementRequest_Cancel = {
};

export declare const CollateralAgreementRequest_Cancel:
  damlTypes.Serializable<CollateralAgreementRequest_Cancel> & {
  }
;


export declare type CollateralAgreementRequest_Reject = {
  reason: string;
};

export declare const CollateralAgreementRequest_Reject:
  damlTypes.Serializable<CollateralAgreementRequest_Reject> & {
  }
;


export declare type CollateralAgreementRequest_Accept = {
};

export declare const CollateralAgreementRequest_Accept:
  damlTypes.Serializable<CollateralAgreementRequest_Accept> & {
  }
;


export declare type CollateralAgreementRequest = {
  operator: damlTypes.Party;
  requestor: damlTypes.Party;
  counterparty: damlTypes.Party;
  id: string;
  requestorIsPartyA: boolean;
  terms: Utility_Collateral_App_Types.Terms;
};

export declare interface CollateralAgreementRequestInterface {
  CollateralAgreementRequest_Accept: damlTypes.Choice<CollateralAgreementRequest, CollateralAgreementRequest_Accept, CollateralAgreementRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreementRequest, undefined>>;
  Archive: damlTypes.Choice<CollateralAgreementRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreementRequest, undefined>>;
  CollateralAgreementRequest_Reject: damlTypes.Choice<CollateralAgreementRequest, CollateralAgreementRequest_Reject, CollateralAgreementRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreementRequest, undefined>>;
  CollateralAgreementRequest_Cancel: damlTypes.Choice<CollateralAgreementRequest, CollateralAgreementRequest_Cancel, CollateralAgreementRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreementRequest, undefined>>;
}
export declare const CollateralAgreementRequest:
  damlTypes.Template<CollateralAgreementRequest, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:CollateralAgreementRequest'> &
  damlTypes.ToInterface<CollateralAgreementRequest, never> &
  CollateralAgreementRequestInterface;

export declare namespace CollateralAgreementRequest {
}



export declare type CollateralAgreement_ProposeChange_Result = {
  collateralAgreementChangeRequestCid: damlTypes.ContractId<CollateralAgreementChangeRequest>;
};

export declare const CollateralAgreement_ProposeChange_Result:
  damlTypes.Serializable<CollateralAgreement_ProposeChange_Result> & {
  }
;


export declare type CollateralAgreement_Terminate_Result = {
};

export declare const CollateralAgreement_Terminate_Result:
  damlTypes.Serializable<CollateralAgreement_Terminate_Result> & {
  }
;


export declare type CollateralAgreement_TransferCollateral_Result = {
  instructedCollateralCid: damlTypes.ContractId<InstructedCollateral>;
};

export declare const CollateralAgreement_TransferCollateral_Result:
  damlTypes.Serializable<CollateralAgreement_TransferCollateral_Result> & {
  }
;


export declare type CollateralAgreement_Terminate = {
  actor: damlTypes.Party;
  collateralStateCid: damlTypes.ContractId<Utility_Collateral_App_Model_State.CollateralState>;
};

export declare const CollateralAgreement_Terminate:
  damlTypes.Serializable<CollateralAgreement_Terminate> & {
  }
;


export declare type CollateralAgreement_ProposeChange = {
  actor: damlTypes.Party;
  updatedTerms: Utility_Collateral_App_Types.Terms;
};

export declare const CollateralAgreement_ProposeChange:
  damlTypes.Serializable<CollateralAgreement_ProposeChange> & {
  }
;


export declare type CollateralAgreement_TransferCollateral = {
  actor: damlTypes.Party;
  positions: Utility_Collateral_App_Types.InstrumentQuantity[];
  reference: string;
  createdAt: damlTypes.Time;
  allocateBefore: damlTypes.Time;
  settleBefore: damlTypes.Time;
};

export declare const CollateralAgreement_TransferCollateral:
  damlTypes.Serializable<CollateralAgreement_TransferCollateral> & {
  }
;


export declare type CollateralAgreement = {
  partyA: damlTypes.Party;
  partyB: damlTypes.Party;
  operator: damlTypes.Party;
  id: string;
  terms: Utility_Collateral_App_Types.Terms;
};

export declare interface CollateralAgreementInterface {
  CollateralAgreement_TransferCollateral: damlTypes.Choice<CollateralAgreement, CollateralAgreement_TransferCollateral, CollateralAgreement_TransferCollateral_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreement, undefined>>;
  CollateralAgreement_ProposeChange: damlTypes.Choice<CollateralAgreement, CollateralAgreement_ProposeChange, CollateralAgreement_ProposeChange_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreement, undefined>>;
  CollateralAgreement_Terminate: damlTypes.Choice<CollateralAgreement, CollateralAgreement_Terminate, CollateralAgreement_Terminate_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreement, undefined>>;
  Archive: damlTypes.Choice<CollateralAgreement, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralAgreement, undefined>>;
}
export declare const CollateralAgreement:
  damlTypes.Template<CollateralAgreement, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Model.Collateral:CollateralAgreement'> &
  damlTypes.ToInterface<CollateralAgreement, never> &
  CollateralAgreementInterface;

export declare namespace CollateralAgreement {
}


