// Generated from Utility/Commercials/V0/Model/Offer.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 from '@daml.js/splice-amulet-0.1.16';

import * as Utility_Commercials_V0_Model_CommercialAgreement from '../../../../../Utility/Commercials/V0/Model/CommercialAgreement/module';
import * as Utility_Commercials_V0_Model_Types from '../../../../../Utility/Commercials/V0/Model/Types/module';

export declare type CommercialAgreementOffer_Reject_Result = {
  reason: string;
};

export declare const CommercialAgreementOffer_Reject_Result:
  damlTypes.Serializable<CommercialAgreementOffer_Reject_Result> & {
  }
;


export declare type CommercialAgreementOffer_Cancel_Result = {
};

export declare const CommercialAgreementOffer_Cancel_Result:
  damlTypes.Serializable<CommercialAgreementOffer_Cancel_Result> & {
  }
;


export declare type CommercialAgreementOffer_AcceptAndTopup_Result = {
  commercialAgreementCid: damlTypes.ContractId<Utility_Commercials_V0_Model_CommercialAgreement.CommercialAgreement>;
};

export declare const CommercialAgreementOffer_AcceptAndTopup_Result:
  damlTypes.Serializable<CommercialAgreementOffer_AcceptAndTopup_Result> & {
  }
;


export declare type CommercialAgreementOffer_Accept_Result = {
  commercialAgreementCid: damlTypes.ContractId<Utility_Commercials_V0_Model_CommercialAgreement.CommercialAgreement>;
};

export declare const CommercialAgreementOffer_Accept_Result:
  damlTypes.Serializable<CommercialAgreementOffer_Accept_Result> & {
  }
;


export declare type CommercialAgreementOffer_Reject = {
  reason: string;
};

export declare const CommercialAgreementOffer_Reject:
  damlTypes.Serializable<CommercialAgreementOffer_Reject> & {
  }
;


export declare type CommercialAgreementOffer_Cancel = {
};

export declare const CommercialAgreementOffer_Cancel:
  damlTypes.Serializable<CommercialAgreementOffer_Cancel> & {
  }
;


export declare type CommercialAgreementOffer_AcceptAndTopup = {
  holderInputs: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet>[];
  appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  dataPublishingConsent: damlTypes.Optional<boolean>;
};

export declare const CommercialAgreementOffer_AcceptAndTopup:
  damlTypes.Serializable<CommercialAgreementOffer_AcceptAndTopup> & {
  }
;


export declare type CommercialAgreementOffer_Accept = {
  dataPublishingConsent: damlTypes.Optional<boolean>;
};

export declare const CommercialAgreementOffer_Accept:
  damlTypes.Serializable<CommercialAgreementOffer_Accept> & {
  }
;


export declare type CommercialAgreementOffer = {
  operator: damlTypes.Party;
  user: damlTypes.Party;
  feeReceiver: damlTypes.Party;
  utilityFees: Utility_Commercials_V0_Model_Types.UtilityFees;
  dso: damlTypes.Party;
  initialDepositAmountCc: damlTypes.Optional<damlTypes.Numeric>;
  rewardReceiver: damlTypes.Optional<damlTypes.Party>;
};

export declare interface CommercialAgreementOfferInterface {
  CommercialAgreementOffer_Accept: damlTypes.Choice<CommercialAgreementOffer, CommercialAgreementOffer_Accept, CommercialAgreementOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreementOffer, undefined>>;
  CommercialAgreementOffer_AcceptAndTopup: damlTypes.Choice<CommercialAgreementOffer, CommercialAgreementOffer_AcceptAndTopup, CommercialAgreementOffer_AcceptAndTopup_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreementOffer, undefined>>;
  CommercialAgreementOffer_Cancel: damlTypes.Choice<CommercialAgreementOffer, CommercialAgreementOffer_Cancel, CommercialAgreementOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreementOffer, undefined>>;
  Archive: damlTypes.Choice<CommercialAgreementOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreementOffer, undefined>>;
  CommercialAgreementOffer_Reject: damlTypes.Choice<CommercialAgreementOffer, CommercialAgreementOffer_Reject, CommercialAgreementOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CommercialAgreementOffer, undefined>>;
}
export declare const CommercialAgreementOffer:
  damlTypes.Template<CommercialAgreementOffer, undefined, '#utility-commercials-v0:Utility.Commercials.V0.Model.Offer:CommercialAgreementOffer'> &
  damlTypes.ToInterface<CommercialAgreementOffer, never> &
  CommercialAgreementOfferInterface;

export declare namespace CommercialAgreementOffer {
}


