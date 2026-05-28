// Generated from Utility/Registry/App/V0/Model/Mint.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b from '@daml.js/splice-api-token-holding-v1-1.0.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type ExecutedMint_Delete_Result = {
};

export declare const ExecutedMint_Delete_Result:
  damlTypes.Serializable<ExecutedMint_Delete_Result> & {
  }
;


export declare type ExecutedMint_Delete = {
  actor: damlTypes.Party;
};

export declare const ExecutedMint_Delete:
  damlTypes.Serializable<ExecutedMint_Delete> & {
  }
;


export declare type ExecutedMint = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  mint: Mint;
  operatorIsObserver: damlTypes.Optional<boolean>;
};

export declare interface ExecutedMintInterface {
  ExecutedMint_Delete: damlTypes.Choice<ExecutedMint, ExecutedMint_Delete, ExecutedMint_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedMint, undefined>>;
  Archive: damlTypes.Choice<ExecutedMint, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedMint, undefined>>;
}
export declare const ExecutedMint:
  damlTypes.Template<ExecutedMint, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Mint:ExecutedMint'> &
  damlTypes.ToInterface<ExecutedMint, never> &
  ExecutedMintInterface;

export declare namespace ExecutedMint {
}



export declare type RejectedMint_Delete_Result = {
};

export declare const RejectedMint_Delete_Result:
  damlTypes.Serializable<RejectedMint_Delete_Result> & {
  }
;


export declare type RejectedMint_Delete = {
  actor: damlTypes.Party;
};

export declare const RejectedMint_Delete:
  damlTypes.Serializable<RejectedMint_Delete> & {
  }
;


export declare type RejectedMint = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  mint: Mint;
  reason: string;
  operatorIsObserver: damlTypes.Optional<boolean>;
};

export declare interface RejectedMintInterface {
  RejectedMint_Delete: damlTypes.Choice<RejectedMint, RejectedMint_Delete, RejectedMint_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedMint, undefined>>;
  Archive: damlTypes.Choice<RejectedMint, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedMint, undefined>>;
}
export declare const RejectedMint:
  damlTypes.Template<RejectedMint, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Mint:RejectedMint'> &
  damlTypes.ToInterface<RejectedMint, never> &
  RejectedMintInterface;

export declare namespace RejectedMint {
}



export declare type MintOffer_Cancel_Result = {
};

export declare const MintOffer_Cancel_Result:
  damlTypes.Serializable<MintOffer_Cancel_Result> & {
  }
;


export declare type MintOffer_Reject_Result = {
  rejectedMintCid: damlTypes.Optional<damlTypes.ContractId<RejectedMint>>;
};

export declare const MintOffer_Reject_Result:
  damlTypes.Serializable<MintOffer_Reject_Result> & {
  }
;


export declare type MintOffer_Accept_Result = {
  holdingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  executedMintCid: damlTypes.Optional<damlTypes.ContractId<ExecutedMint>>;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const MintOffer_Accept_Result:
  damlTypes.Serializable<MintOffer_Accept_Result> & {
  }
;


export declare type MintOffer_Cancel = {
};

export declare const MintOffer_Cancel:
  damlTypes.Serializable<MintOffer_Cancel> & {
  }
;


export declare type MintOffer_Reject = {
  reason: string;
  extraArgs: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs>;
};

export declare const MintOffer_Reject:
  damlTypes.Serializable<MintOffer_Reject> & {
  }
;


export declare type MintOffer_Accept = {
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const MintOffer_Accept:
  damlTypes.Serializable<MintOffer_Accept> & {
  }
;


export declare type MintOffer = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  mint: Mint;
};

export declare interface MintOfferInterface {
  MintOffer_Accept: damlTypes.Choice<MintOffer, MintOffer_Accept, MintOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintOffer, undefined>>;
  MintOffer_Reject: damlTypes.Choice<MintOffer, MintOffer_Reject, MintOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintOffer, undefined>>;
  MintOffer_Cancel: damlTypes.Choice<MintOffer, MintOffer_Cancel, MintOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintOffer, undefined>>;
  Archive: damlTypes.Choice<MintOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintOffer, undefined>>;
}
export declare const MintOffer:
  damlTypes.Template<MintOffer, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Mint:MintOffer'> &
  damlTypes.ToInterface<MintOffer, never> &
  MintOfferInterface;

export declare namespace MintOffer {
}



export declare type MintRequest_Accept_Result = {
  holdingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  executedMintCid: damlTypes.Optional<damlTypes.ContractId<ExecutedMint>>;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const MintRequest_Accept_Result:
  damlTypes.Serializable<MintRequest_Accept_Result> & {
  }
;


export declare type MintRequest_Cancel_Result = {
};

export declare const MintRequest_Cancel_Result:
  damlTypes.Serializable<MintRequest_Cancel_Result> & {
  }
;


export declare type MintRequest_Reject_Result = {
  rejectedMintCid: damlTypes.Optional<damlTypes.ContractId<RejectedMint>>;
};

export declare const MintRequest_Reject_Result:
  damlTypes.Serializable<MintRequest_Reject_Result> & {
  }
;


export declare type MintRequest_Cancel = {
};

export declare const MintRequest_Cancel:
  damlTypes.Serializable<MintRequest_Cancel> & {
  }
;


export declare type MintRequest_Reject = {
  reason: string;
  extraArgs: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs>;
};

export declare const MintRequest_Reject:
  damlTypes.Serializable<MintRequest_Reject> & {
  }
;


export declare type MintRequest_Accept = {
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const MintRequest_Accept:
  damlTypes.Serializable<MintRequest_Accept> & {
  }
;


export declare type MintRequest = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  mint: Mint;
};

export declare interface MintRequestInterface {
  MintRequest_Accept: damlTypes.Choice<MintRequest, MintRequest_Accept, MintRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintRequest, undefined>>;
  MintRequest_Reject: damlTypes.Choice<MintRequest, MintRequest_Reject, MintRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintRequest, undefined>>;
  Archive: damlTypes.Choice<MintRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintRequest, undefined>>;
  MintRequest_Cancel: damlTypes.Choice<MintRequest, MintRequest_Cancel, MintRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintRequest, undefined>>;
}
export declare const MintRequest:
  damlTypes.Template<MintRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Mint:MintRequest'> &
  damlTypes.ToInterface<MintRequest, never> &
  MintRequestInterface;

export declare namespace MintRequest {
}



export declare type Mint = {
  instrumentId: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId;
  amount: damlTypes.Numeric;
  holder: damlTypes.Party;
  reference: string;
  requestedAt: damlTypes.Time;
  executeBefore: damlTypes.Time;
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata;
};

export declare const Mint:
  damlTypes.Serializable<Mint> & {
  }
;

