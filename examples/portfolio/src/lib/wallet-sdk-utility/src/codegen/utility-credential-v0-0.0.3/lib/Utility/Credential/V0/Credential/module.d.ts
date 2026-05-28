// Generated from Utility/Credential/V0/Credential.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 from '@daml.js/daml-prim-DA-Types-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff from '@daml.js/daml-stdlib-DA-Set-Types-1.0.0';

export declare type PartyCredentialRequirement = {
  issuer: damlTypes.Party;
  requiredClaims: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<string, string>[];
};

export declare const PartyCredentialRequirement:
  damlTypes.Serializable<PartyCredentialRequirement> & {
  }
;


export declare type Credential_Revoke_Result = {
};

export declare const Credential_Revoke_Result:
  damlTypes.Serializable<Credential_Revoke_Result> & {
  }
;


export declare type Credential_Get_Result = {
  credential: Credential;
};

export declare const Credential_Get_Result:
  damlTypes.Serializable<Credential_Get_Result> & {
  }
;


export declare type Credential_Revoke = {
  actor: damlTypes.Party;
};

export declare const Credential_Revoke:
  damlTypes.Serializable<Credential_Revoke> & {
  }
;


export declare type Credential_Get = {
  actor: damlTypes.Party;
};

export declare const Credential_Get:
  damlTypes.Serializable<Credential_Get> & {
  }
;


export declare type Credential = {
  issuer: damlTypes.Party;
  holder: damlTypes.Party;
  id: string;
  description: string;
  validFrom: damlTypes.Optional<damlTypes.Time>;
  validUntil: damlTypes.Optional<damlTypes.Time>;
  claims: Claim[];
  observers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>;
};

export declare interface CredentialInterface {
  Credential_Revoke: damlTypes.Choice<Credential, Credential_Revoke, Credential_Revoke_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Credential, undefined>>;
  Archive: damlTypes.Choice<Credential, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Credential, undefined>>;
  Credential_Get: damlTypes.Choice<Credential, Credential_Get, Credential_Get_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Credential, undefined>>;
}
export declare const Credential:
  damlTypes.Template<Credential, undefined, '#utility-credential-v0:Utility.Credential.V0.Credential:Credential'> &
  damlTypes.ToInterface<Credential, never> &
  CredentialInterface;

export declare namespace Credential {
}



export declare type Claim = {
  subject: string;
  property: string;
  value: string;
};

export declare const Claim:
  damlTypes.Serializable<Claim> & {
  }
;

