// Generated from Splice/Api/Token/BurnMintV1.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b from '@daml.js/splice-api-token-holding-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type BurnMintFactory = damlTypes.Interface<'#splice-api-token-burn-mint-v1:Splice.Api.Token.BurnMintV1:BurnMintFactory'> & BurnMintFactoryView;
export declare interface BurnMintFactoryInterface {
  Archive: damlTypes.Choice<BurnMintFactory, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<BurnMintFactory, undefined>>;
  BurnMintFactory_PublicFetch: damlTypes.Choice<BurnMintFactory, BurnMintFactory_PublicFetch, BurnMintFactoryView, undefined> & damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<BurnMintFactory, undefined>>;
  BurnMintFactory_BurnMint: damlTypes.Choice<BurnMintFactory, BurnMintFactory_BurnMint, BurnMintFactory_BurnMintResult, undefined> & damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<BurnMintFactory, undefined>>;
}
export declare const BurnMintFactory:
  damlTypes.InterfaceCompanion<BurnMintFactory, undefined, '#splice-api-token-burn-mint-v1:Splice.Api.Token.BurnMintV1:BurnMintFactory'> &
  damlTypes.FromTemplate<BurnMintFactory, unknown> &
  BurnMintFactoryInterface;


export declare type BurnMintFactoryView = {
  admin: damlTypes.Party;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const BurnMintFactoryView:
  damlTypes.Serializable<BurnMintFactoryView> & {
  }
;


export declare type BurnMintFactory_BurnMintResult = {
  outputCids: damlTypes.ContractId<pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding>[];
};

export declare const BurnMintFactory_BurnMintResult:
  damlTypes.Serializable<BurnMintFactory_BurnMintResult> & {
  }
;


export declare type BurnMintOutput = {
  owner: damlTypes.Party;
  amount: damlTypes.Numeric;
  context: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ChoiceContext;
};

export declare const BurnMintOutput:
  damlTypes.Serializable<BurnMintOutput> & {
  }
;


export declare type BurnMintFactory_PublicFetch = {
  expectedAdmin: damlTypes.Party;
  actor: damlTypes.Party;
};

export declare const BurnMintFactory_PublicFetch:
  damlTypes.Serializable<BurnMintFactory_PublicFetch> & {
  }
;


export declare type BurnMintFactory_BurnMint = {
  expectedAdmin: damlTypes.Party;
  instrumentId: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId;
  inputHoldingCids: damlTypes.ContractId<pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding>[];
  outputs: BurnMintOutput[];
  extraActors: damlTypes.Party[];
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const BurnMintFactory_BurnMint:
  damlTypes.Serializable<BurnMintFactory_BurnMint> & {
  }
;

