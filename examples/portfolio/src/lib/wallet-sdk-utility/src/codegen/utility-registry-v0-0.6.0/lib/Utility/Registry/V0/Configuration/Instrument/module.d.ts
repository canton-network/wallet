// Generated from Utility/Registry/V0/Configuration/Instrument.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda from '@daml.js/splice-api-featured-app-v1-1.0.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type InstrumentConfiguration_Get_Result = {
  instrumentConfiguration: InstrumentConfiguration;
};

export declare const InstrumentConfiguration_Get_Result:
  damlTypes.Serializable<InstrumentConfiguration_Get_Result> & {
  }
;


export declare type InstrumentConfiguration_Get = {
  actor: damlTypes.Party;
};

export declare const InstrumentConfiguration_Get:
  damlTypes.Serializable<InstrumentConfiguration_Get> & {
  }
;


export declare type InstrumentConfiguration_SetProviderAppRewardBeneficiaries = {
  providerAppRewardBeneficiaries: damlTypes.Optional<pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary[]>;
};

export declare const InstrumentConfiguration_SetProviderAppRewardBeneficiaries:
  damlTypes.Serializable<InstrumentConfiguration_SetProviderAppRewardBeneficiaries> & {
  }
;


export declare type InstrumentConfiguration = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  defaultIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  additionalIdentifiers: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier[];
  issuerRequirements: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement[];
  holderRequirements: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement[];
  providerAppRewardBeneficiaries: damlTypes.Optional<pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary[]>;
};

export declare interface InstrumentConfigurationInterface {
  InstrumentConfiguration_SetProviderAppRewardBeneficiaries: damlTypes.Choice<InstrumentConfiguration, InstrumentConfiguration_SetProviderAppRewardBeneficiaries, damlTypes.ContractId<InstrumentConfiguration>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InstrumentConfiguration, undefined>>;
  Archive: damlTypes.Choice<InstrumentConfiguration, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InstrumentConfiguration, undefined>>;
  InstrumentConfiguration_Get: damlTypes.Choice<InstrumentConfiguration, InstrumentConfiguration_Get, InstrumentConfiguration_Get_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InstrumentConfiguration, undefined>>;
}
export declare const InstrumentConfiguration:
  damlTypes.Template<InstrumentConfiguration, undefined, '#utility-registry-v0:Utility.Registry.V0.Configuration.Instrument:InstrumentConfiguration'> &
  damlTypes.ToInterface<InstrumentConfiguration, never> &
  InstrumentConfigurationInterface;

export declare namespace InstrumentConfiguration {
}


