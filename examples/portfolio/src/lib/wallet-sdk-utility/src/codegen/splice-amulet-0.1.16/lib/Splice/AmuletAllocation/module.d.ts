// Generated from Splice/AmuletAllocation.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d from '@daml.js/splice-api-token-allocation-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Splice_Amulet from '../../Splice/Amulet/module';

export declare type AmuletAllocation = {
  lockedAmulet: damlTypes.ContractId<Splice_Amulet.LockedAmulet>;
  allocation: pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.AllocationSpecification;
};

export declare interface AmuletAllocationInterface {
  Archive: damlTypes.Choice<AmuletAllocation, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletAllocation, undefined>>;
}
export declare const AmuletAllocation:
  damlTypes.Template<AmuletAllocation, undefined, '#splice-amulet:Splice.AmuletAllocation:AmuletAllocation'> &
  damlTypes.ToInterface<AmuletAllocation, pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation> &
  AmuletAllocationInterface;

export declare namespace AmuletAllocation {
}


