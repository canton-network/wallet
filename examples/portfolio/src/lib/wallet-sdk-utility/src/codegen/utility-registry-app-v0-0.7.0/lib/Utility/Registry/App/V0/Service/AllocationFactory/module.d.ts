// Generated from Utility/Registry/App/V0/Service/AllocationFactory.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520 from '@daml.js/splice-api-token-allocation-instruction-v1-1.0.0';
import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 from '@daml.js/splice-api-token-transfer-instruction-v1-1.0.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e from '@daml.js/splice-api-token-burn-mint-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Registry_App_V0_Model_Burn from '../../../../../../Utility/Registry/App/V0/Model/Burn/module';
import * as Utility_Registry_App_V0_Model_Mint from '../../../../../../Utility/Registry/App/V0/Model/Mint/module';

export declare type AllocationFactory_OfferMint_Result = {
  mintOfferCid: damlTypes.ContractId<Utility_Registry_App_V0_Model_Mint.MintOffer>;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const AllocationFactory_OfferMint_Result:
  damlTypes.Serializable<AllocationFactory_OfferMint_Result> & {
  }
;


export declare type AllocationFactory_RequestMint_Result = {
  mintRequestCid: damlTypes.ContractId<Utility_Registry_App_V0_Model_Mint.MintRequest>;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const AllocationFactory_RequestMint_Result:
  damlTypes.Serializable<AllocationFactory_RequestMint_Result> & {
  }
;


export declare type AllocationFactory_OfferBurn_Result = {
  burnOfferCid: damlTypes.ContractId<Utility_Registry_App_V0_Model_Burn.BurnOffer>;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const AllocationFactory_OfferBurn_Result:
  damlTypes.Serializable<AllocationFactory_OfferBurn_Result> & {
  }
;


export declare type AllocationFactory_RequestBurn_Result = {
  burnRequestCid: damlTypes.ContractId<Utility_Registry_App_V0_Model_Burn.BurnRequest>;
  remaining: damlTypes.Optional<damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>>;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const AllocationFactory_RequestBurn_Result:
  damlTypes.Serializable<AllocationFactory_RequestBurn_Result> & {
  }
;


export declare type AllocationFactory_OfferMint = {
  expectedAdmin: damlTypes.Party;
  mint: Utility_Registry_App_V0_Model_Mint.Mint;
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const AllocationFactory_OfferMint:
  damlTypes.Serializable<AllocationFactory_OfferMint> & {
  }
;


export declare type AllocationFactory_RequestMint = {
  expectedAdmin: damlTypes.Party;
  mint: Utility_Registry_App_V0_Model_Mint.Mint;
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const AllocationFactory_RequestMint:
  damlTypes.Serializable<AllocationFactory_RequestMint> & {
  }
;


export declare type AllocationFactory_OfferBurn = {
  expectedAdmin: damlTypes.Party;
  burn: Utility_Registry_App_V0_Model_Burn.Burn;
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const AllocationFactory_OfferBurn:
  damlTypes.Serializable<AllocationFactory_OfferBurn> & {
  }
;


export declare type AllocationFactory_RequestBurn = {
  expectedAdmin: damlTypes.Party;
  burn: Utility_Registry_App_V0_Model_Burn.Burn;
  holdingCids: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>[];
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const AllocationFactory_RequestBurn:
  damlTypes.Serializable<AllocationFactory_RequestBurn> & {
  }
;


export declare type AllocationFactory_TransferInternal = {
  payload: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory_Transfer;
};

export declare const AllocationFactory_TransferInternal:
  damlTypes.Serializable<AllocationFactory_TransferInternal> & {
  }
;


export declare type AllocationFactory_InternalBurnMint = {
  payload: pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e.Splice.Api.Token.BurnMintV1.BurnMintFactory_BurnMint;
};

export declare const AllocationFactory_InternalBurnMint:
  damlTypes.Serializable<AllocationFactory_InternalBurnMint> & {
  }
;


export declare type AllocationFactory_AllocateInternal = {
  payload: pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory_Allocate;
};

export declare const AllocationFactory_AllocateInternal:
  damlTypes.Serializable<AllocationFactory_AllocateInternal> & {
  }
;


export declare type AllocationFactory = {
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  operator: damlTypes.Party;
};

export declare interface AllocationFactoryInterface {
  AllocationFactory_AllocateInternal: damlTypes.Choice<AllocationFactory, AllocationFactory_AllocateInternal, pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationInstructionResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AllocationFactory, undefined>>;
  AllocationFactory_InternalBurnMint: damlTypes.Choice<AllocationFactory, AllocationFactory_InternalBurnMint, pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e.Splice.Api.Token.BurnMintV1.BurnMintFactory_BurnMintResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AllocationFactory, undefined>>;
  AllocationFactory_TransferInternal: damlTypes.Choice<AllocationFactory, AllocationFactory_TransferInternal, pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferInstructionResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AllocationFactory, undefined>>;
  AllocationFactory_RequestBurn: damlTypes.Choice<AllocationFactory, AllocationFactory_RequestBurn, AllocationFactory_RequestBurn_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AllocationFactory, undefined>>;
  AllocationFactory_OfferBurn: damlTypes.Choice<AllocationFactory, AllocationFactory_OfferBurn, AllocationFactory_OfferBurn_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AllocationFactory, undefined>>;
  AllocationFactory_RequestMint: damlTypes.Choice<AllocationFactory, AllocationFactory_RequestMint, AllocationFactory_RequestMint_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AllocationFactory, undefined>>;
  AllocationFactory_OfferMint: damlTypes.Choice<AllocationFactory, AllocationFactory_OfferMint, AllocationFactory_OfferMint_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AllocationFactory, undefined>>;
  Archive: damlTypes.Choice<AllocationFactory, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AllocationFactory, undefined>>;
}
export declare const AllocationFactory:
  damlTypes.Template<AllocationFactory, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.AllocationFactory:AllocationFactory'> &
  damlTypes.ToInterface<AllocationFactory, pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory | pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory | pkg9cc2cbc838ef38dc2c7f34014c9c452bcf71b8e2a4f939235fc0b5d0924b185e.Splice.Api.Token.BurnMintV1.BurnMintFactory> &
  AllocationFactoryInterface;

export declare namespace AllocationFactory {
}


