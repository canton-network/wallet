// Generated from Utility/Credential/App/V0/Service/User.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 from '@daml.js/splice-amulet-0.1.16';

import * as Utility_Credential_App_V0_Model_Billing from '../../../../../../Utility/Credential/App/V0/Model/Billing/module';
import * as Utility_Credential_App_V0_Model_Offer from '../../../../../../Utility/Credential/App/V0/Model/Offer/module';
import * as Utility_Credential_App_V0_Types from '../../../../../../Utility/Credential/App/V0/Types/module';

export declare type UserServiceRequest_Reject_Result = {
};

export declare const UserServiceRequest_Reject_Result:
  damlTypes.Serializable<UserServiceRequest_Reject_Result> & {
  }
;


export declare type UserServiceRequest_Cancel_Result = {
};

export declare const UserServiceRequest_Cancel_Result:
  damlTypes.Serializable<UserServiceRequest_Cancel_Result> & {
  }
;


export declare type UserServiceRequest_Accept_Result = {
  userServiceCid: damlTypes.ContractId<UserService>;
};

export declare const UserServiceRequest_Accept_Result:
  damlTypes.Serializable<UserServiceRequest_Accept_Result> & {
  }
;


export declare type UserServiceRequest_Reject = {
};

export declare const UserServiceRequest_Reject:
  damlTypes.Serializable<UserServiceRequest_Reject> & {
  }
;


export declare type UserServiceRequest_Cancel = {
};

export declare const UserServiceRequest_Cancel:
  damlTypes.Serializable<UserServiceRequest_Cancel> & {
  }
;


export declare type UserServiceRequest_Accept = {
  dso: damlTypes.Party;
};

export declare const UserServiceRequest_Accept:
  damlTypes.Serializable<UserServiceRequest_Accept> & {
  }
;


export declare type UserServiceRequest = {
  operator: damlTypes.Party;
  user: damlTypes.Party;
};

export declare interface UserServiceRequestInterface {
  UserServiceRequest_Accept: damlTypes.Choice<UserServiceRequest, UserServiceRequest_Accept, UserServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserServiceRequest, undefined>>;
  UserServiceRequest_Cancel: damlTypes.Choice<UserServiceRequest, UserServiceRequest_Cancel, UserServiceRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserServiceRequest, undefined>>;
  Archive: damlTypes.Choice<UserServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserServiceRequest, undefined>>;
  UserServiceRequest_Reject: damlTypes.Choice<UserServiceRequest, UserServiceRequest_Reject, UserServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserServiceRequest, undefined>>;
}
export declare const UserServiceRequest:
  damlTypes.Template<UserServiceRequest, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Service.User:UserServiceRequest'> &
  damlTypes.ToInterface<UserServiceRequest, never> &
  UserServiceRequestInterface;

export declare namespace UserServiceRequest {
}



export declare type DistributionSlice = {
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
  percentage: damlTypes.Numeric;
};

export declare const DistributionSlice:
  damlTypes.Serializable<DistributionSlice> & {
  }
;


export declare type UserService_Terminate_Result = {
};

export declare const UserService_Terminate_Result:
  damlTypes.Serializable<UserService_Terminate_Result> & {
  }
;


export declare type UserService_OfferPaidCredential_Result = {
  credentialOfferCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Offer.CredentialOffer>;
};

export declare const UserService_OfferPaidCredential_Result:
  damlTypes.Serializable<UserService_OfferPaidCredential_Result> & {
  }
;


export declare type UserService_OfferFreeCredential_Result = {
  credentialOfferCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Offer.CredentialOffer>;
};

export declare const UserService_OfferFreeCredential_Result:
  damlTypes.Serializable<UserService_OfferFreeCredential_Result> & {
  }
;


export declare type UserService_DistributeMulti_Result = {
  transferResults: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult[];
};

export declare const UserService_DistributeMulti_Result:
  damlTypes.Serializable<UserService_DistributeMulti_Result> & {
  }
;


export declare type UserService_DistributeAndAdjustDepositMulti_Result = {
  transferResults: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferResult[];
};

export declare const UserService_DistributeAndAdjustDepositMulti_Result:
  damlTypes.Serializable<UserService_DistributeAndAdjustDepositMulti_Result> & {
  }
;


export declare type UserService_RevokeCredentialAndCancelBilling = {
  credentialCid: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>;
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const UserService_RevokeCredentialAndCancelBilling:
  damlTypes.Serializable<UserService_RevokeCredentialAndCancelBilling> & {
  }
;


export declare type UserService_CancelCredentialBilling = {
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const UserService_CancelCredentialBilling:
  damlTypes.Serializable<UserService_CancelCredentialBilling> & {
  }
;


export declare type UserService_RevokeCredential = {
  credentialCid: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>;
};

export declare const UserService_RevokeCredential:
  damlTypes.Serializable<UserService_RevokeCredential> & {
  }
;


export declare type UserService_BillingParamsAdjustmentRequest_Cancel = {
  requestCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest>;
};

export declare const UserService_BillingParamsAdjustmentRequest_Cancel:
  damlTypes.Serializable<UserService_BillingParamsAdjustmentRequest_Cancel> & {
  }
;


export declare type UserService_BillingParamsAdjustmentRequest_Accept = {
  requestCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest>;
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
};

export declare const UserService_BillingParamsAdjustmentRequest_Accept:
  damlTypes.Serializable<UserService_BillingParamsAdjustmentRequest_Accept> & {
  }
;


export declare type UserService_RequestToAdjustBillingParams = {
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
  billingParams: Utility_Credential_App_V0_Types.BillingParams;
};

export declare const UserService_RequestToAdjustBillingParams:
  damlTypes.Serializable<UserService_RequestToAdjustBillingParams> & {
  }
;


export declare type UserService_AdjustBillingParams = {
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
  billingParams: Utility_Credential_App_V0_Types.BillingParams;
};

export declare const UserService_AdjustBillingParams:
  damlTypes.Serializable<UserService_AdjustBillingParams> & {
  }
;


export declare type UserService_TopUp = {
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
  amountUsd: damlTypes.Numeric;
  coinCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const UserService_TopUp:
  damlTypes.Serializable<UserService_TopUp> & {
  }
;


export declare type UserService_DistributeAndAdjustDepositMulti = {
  distributionSlices: DistributionSlice[];
  amountUsd: damlTypes.Numeric;
  coinCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const UserService_DistributeAndAdjustDepositMulti:
  damlTypes.Serializable<UserService_DistributeAndAdjustDepositMulti> & {
  }
;


export declare type UserService_DistributeAndAdjustDeposit = {
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
  amountUsd: damlTypes.Numeric;
  coinCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const UserService_DistributeAndAdjustDeposit:
  damlTypes.Serializable<UserService_DistributeAndAdjustDeposit> & {
  }
;


export declare type UserService_DistributeMulti = {
  distributionSlices: DistributionSlice[];
  amountUsd: damlTypes.Numeric;
  coinCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const UserService_DistributeMulti:
  damlTypes.Serializable<UserService_DistributeMulti> & {
  }
;


export declare type UserService_Distribute = {
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
  amountUsd: damlTypes.Numeric;
  coinCids: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const UserService_Distribute:
  damlTypes.Serializable<UserService_Distribute> & {
  }
;


export declare type UserService_CancelCredentialOffer = {
  credentialOfferCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Offer.CredentialOffer>;
};

export declare const UserService_CancelCredentialOffer:
  damlTypes.Serializable<UserService_CancelCredentialOffer> & {
  }
;


export declare type UserService_RejectCredentialOffer = {
  credentialOfferCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Offer.CredentialOffer>;
  reason: string;
};

export declare const UserService_RejectCredentialOffer:
  damlTypes.Serializable<UserService_RejectCredentialOffer> & {
  }
;


export declare type UserService_AcceptFreeCredentialOffer = {
  credentialOfferCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Offer.CredentialOffer>;
};

export declare const UserService_AcceptFreeCredentialOffer:
  damlTypes.Serializable<UserService_AcceptFreeCredentialOffer> & {
  }
;


export declare type UserService_AcceptPaidCredentialOffer = {
  credentialOfferCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Offer.CredentialOffer>;
  depositAmulets: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const UserService_AcceptPaidCredentialOffer:
  damlTypes.Serializable<UserService_AcceptPaidCredentialOffer> & {
  }
;


export declare type UserService_OfferFreeCredential = {
  holder: damlTypes.Party;
  id: string;
  description: string;
  claims: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Claim[];
};

export declare const UserService_OfferFreeCredential:
  damlTypes.Serializable<UserService_OfferFreeCredential> & {
  }
;


export declare type UserService_OfferPaidCredential = {
  holder: damlTypes.Party;
  id: string;
  description: string;
  claims: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Claim[];
  billingParams: Utility_Credential_App_V0_Types.BillingParams;
  depositInitialAmountUsd: damlTypes.Optional<damlTypes.Numeric>;
};

export declare const UserService_OfferPaidCredential:
  damlTypes.Serializable<UserService_OfferPaidCredential> & {
  }
;


export declare type UserService_Terminate = {
  actor: damlTypes.Party;
};

export declare const UserService_Terminate:
  damlTypes.Serializable<UserService_Terminate> & {
  }
;


export declare type UserService = {
  operator: damlTypes.Party;
  user: damlTypes.Party;
  dso: damlTypes.Party;
};

export declare interface UserServiceInterface {
  UserService_OfferPaidCredential: damlTypes.Choice<UserService, UserService_OfferPaidCredential, UserService_OfferPaidCredential_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_OfferFreeCredential: damlTypes.Choice<UserService, UserService_OfferFreeCredential, UserService_OfferFreeCredential_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_AcceptPaidCredentialOffer: damlTypes.Choice<UserService, UserService_AcceptPaidCredentialOffer, Utility_Credential_App_V0_Model_Offer.CredentialOffer_AcceptPaid_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_AcceptFreeCredentialOffer: damlTypes.Choice<UserService, UserService_AcceptFreeCredentialOffer, Utility_Credential_App_V0_Model_Offer.CredentialOffer_AcceptFree_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_RejectCredentialOffer: damlTypes.Choice<UserService, UserService_RejectCredentialOffer, Utility_Credential_App_V0_Model_Offer.CredentialOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_CancelCredentialOffer: damlTypes.Choice<UserService, UserService_CancelCredentialOffer, Utility_Credential_App_V0_Model_Offer.CredentialOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_Distribute: damlTypes.Choice<UserService, UserService_Distribute, Utility_Credential_App_V0_Model_Billing.CredentialBilling_Distribute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_DistributeMulti: damlTypes.Choice<UserService, UserService_DistributeMulti, UserService_DistributeMulti_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_DistributeAndAdjustDeposit: damlTypes.Choice<UserService, UserService_DistributeAndAdjustDeposit, Utility_Credential_App_V0_Model_Billing.CredentialBilling_DistributeAndAdjustDeposit_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_DistributeAndAdjustDepositMulti: damlTypes.Choice<UserService, UserService_DistributeAndAdjustDepositMulti, UserService_DistributeAndAdjustDepositMulti_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_TopUp: damlTypes.Choice<UserService, UserService_TopUp, Utility_Credential_App_V0_Model_Billing.CredentialBilling_TopUp_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_AdjustBillingParams: damlTypes.Choice<UserService, UserService_AdjustBillingParams, Utility_Credential_App_V0_Model_Billing.CredentialBilling_AdjustBillingParams_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_RequestToAdjustBillingParams: damlTypes.Choice<UserService, UserService_RequestToAdjustBillingParams, Utility_Credential_App_V0_Model_Billing.CredentialBilling_RequestToAdjustBillingParams_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_BillingParamsAdjustmentRequest_Accept: damlTypes.Choice<UserService, UserService_BillingParamsAdjustmentRequest_Accept, Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_BillingParamsAdjustmentRequest_Cancel: damlTypes.Choice<UserService, UserService_BillingParamsAdjustmentRequest_Cancel, Utility_Credential_App_V0_Model_Billing.BillingParamsAdjustmentRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_RevokeCredential: damlTypes.Choice<UserService, UserService_RevokeCredential, pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential_Revoke_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_CancelCredentialBilling: damlTypes.Choice<UserService, UserService_CancelCredentialBilling, Utility_Credential_App_V0_Model_Billing.CredentialBilling_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_RevokeCredentialAndCancelBilling: damlTypes.Choice<UserService, UserService_RevokeCredentialAndCancelBilling, Utility_Credential_App_V0_Model_Billing.CredentialBilling_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_Terminate: damlTypes.Choice<UserService, UserService_Terminate, UserService_Terminate_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  Archive: damlTypes.Choice<UserService, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
}
export declare const UserService:
  damlTypes.Template<UserService, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Service.User:UserService'> &
  damlTypes.ToInterface<UserService, never> &
  UserServiceInterface;

export declare namespace UserService {
}


