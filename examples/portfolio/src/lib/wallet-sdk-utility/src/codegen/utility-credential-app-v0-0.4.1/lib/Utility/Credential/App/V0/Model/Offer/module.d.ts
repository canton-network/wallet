// Generated from Utility/Credential/App/V0/Model/Offer.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 from '@daml.js/splice-amulet-0.1.16';

import * as Utility_Credential_App_V0_Model_Billing from '../../../../../../Utility/Credential/App/V0/Model/Billing/module';
import * as Utility_Credential_App_V0_Types from '../../../../../../Utility/Credential/App/V0/Types/module';

export declare type RejectedCredentialOffer = {
  offer: CredentialOffer;
  reason: string;
};

export declare interface RejectedCredentialOfferInterface {
  Archive: damlTypes.Choice<RejectedCredentialOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedCredentialOffer, undefined>>;
}
export declare const RejectedCredentialOffer:
  damlTypes.Template<RejectedCredentialOffer, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Offer:RejectedCredentialOffer'> &
  damlTypes.ToInterface<RejectedCredentialOffer, never> &
  RejectedCredentialOfferInterface;

export declare namespace RejectedCredentialOffer {
}



export declare type CredentialOffer_Reject_Result = {
  rejectedCredentialOfferCid: damlTypes.ContractId<RejectedCredentialOffer>;
};

export declare const CredentialOffer_Reject_Result:
  damlTypes.Serializable<CredentialOffer_Reject_Result> & {
  }
;


export declare type CredentialOffer_Cancel_Result = {
};

export declare const CredentialOffer_Cancel_Result:
  damlTypes.Serializable<CredentialOffer_Cancel_Result> & {
  }
;


export declare type CredentialOffer_AcceptPaid_Result = {
  credentialBillingCid: damlTypes.ContractId<Utility_Credential_App_V0_Model_Billing.CredentialBilling>;
  credentialCid: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>;
};

export declare const CredentialOffer_AcceptPaid_Result:
  damlTypes.Serializable<CredentialOffer_AcceptPaid_Result> & {
  }
;


export declare type CredentialOffer_AcceptFree_Result = {
  credentialCid: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>;
};

export declare const CredentialOffer_AcceptFree_Result:
  damlTypes.Serializable<CredentialOffer_AcceptFree_Result> & {
  }
;


export declare type CredentialOffer_Reject = {
  reason: string;
};

export declare const CredentialOffer_Reject:
  damlTypes.Serializable<CredentialOffer_Reject> & {
  }
;


export declare type CredentialOffer_Cancel = {
};

export declare const CredentialOffer_Cancel:
  damlTypes.Serializable<CredentialOffer_Cancel> & {
  }
;


export declare type CredentialOffer_AcceptPaid = {
  holderInputs: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const CredentialOffer_AcceptPaid:
  damlTypes.Serializable<CredentialOffer_AcceptPaid> & {
  }
;


export declare type CredentialOffer_AcceptFree = {
};

export declare const CredentialOffer_AcceptFree:
  damlTypes.Serializable<CredentialOffer_AcceptFree> & {
  }
;


export declare type CredentialOffer = {
  operator: damlTypes.Party;
  issuer: damlTypes.Party;
  holder: damlTypes.Party;
  dso: damlTypes.Party;
  id: string;
  description: string;
  claims: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Claim[];
  billingParams: damlTypes.Optional<Utility_Credential_App_V0_Types.BillingParams>;
  depositInitialAmountUsd: damlTypes.Optional<damlTypes.Numeric>;
};

export declare interface CredentialOfferInterface {
  Archive: damlTypes.Choice<CredentialOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialOffer, undefined>>;
  CredentialOffer_AcceptFree: damlTypes.Choice<CredentialOffer, CredentialOffer_AcceptFree, CredentialOffer_AcceptFree_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialOffer, undefined>>;
  CredentialOffer_AcceptPaid: damlTypes.Choice<CredentialOffer, CredentialOffer_AcceptPaid, CredentialOffer_AcceptPaid_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialOffer, undefined>>;
  CredentialOffer_Cancel: damlTypes.Choice<CredentialOffer, CredentialOffer_Cancel, CredentialOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialOffer, undefined>>;
  CredentialOffer_Reject: damlTypes.Choice<CredentialOffer, CredentialOffer_Reject, CredentialOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CredentialOffer, undefined>>;
}
export declare const CredentialOffer:
  damlTypes.Template<CredentialOffer, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Offer:CredentialOffer'> &
  damlTypes.ToInterface<CredentialOffer, never> &
  CredentialOfferInterface;

export declare namespace CredentialOffer {
}


