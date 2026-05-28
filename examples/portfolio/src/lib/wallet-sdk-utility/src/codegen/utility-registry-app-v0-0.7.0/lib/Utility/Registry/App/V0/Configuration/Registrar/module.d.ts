// Generated from Utility/Registry/App/V0/Configuration/Registrar.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type RegistrarConfiguration_Get_Result = {
  registrarConfiguration: RegistrarConfiguration;
};

export declare const RegistrarConfiguration_Get_Result:
  damlTypes.Serializable<RegistrarConfiguration_Get_Result> & {
  }
;


export declare type RegistrarConfiguration_Get = {
  actor: damlTypes.Party;
};

export declare const RegistrarConfiguration_Get:
  damlTypes.Serializable<RegistrarConfiguration_Get> & {
  }
;


export declare type RegistrarConfiguration = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  enforcementRequirements: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement[];
};

export declare interface RegistrarConfigurationInterface {
  Archive: damlTypes.Choice<RegistrarConfiguration, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarConfiguration, undefined>>;
  RegistrarConfiguration_Get: damlTypes.Choice<RegistrarConfiguration, RegistrarConfiguration_Get, RegistrarConfiguration_Get_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarConfiguration, undefined>>;
}
export declare const RegistrarConfiguration:
  damlTypes.Template<RegistrarConfiguration, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Configuration.Registrar:RegistrarConfiguration'> &
  damlTypes.ToInterface<RegistrarConfiguration, never> &
  RegistrarConfigurationInterface;

export declare namespace RegistrarConfiguration {
}


