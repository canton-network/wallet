// Generated from Utility/Registry/V0/Holding/Mint.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Registry_V0_Configuration_Instrument from '../../../../../Utility/Registry/V0/Configuration/Instrument/module';
import * as Utility_Registry_V0_Types from '../../../../../Utility/Registry/V0/Types/module';

export declare type ExecutedMint_Delete_Result = {
};

export declare const ExecutedMint_Delete_Result:
  damlTypes.Serializable<ExecutedMint_Delete_Result> & {
  }
;


export declare type RejectedMint_Delete_Result = {
};

export declare const RejectedMint_Delete_Result:
  damlTypes.Serializable<RejectedMint_Delete_Result> & {
  }
;


export declare type FailedMint_Delete_Result = {
};

export declare const FailedMint_Delete_Result:
  damlTypes.Serializable<FailedMint_Delete_Result> & {
  }
;


export declare type AcceptedMint_Fail_Result = {
  failedMintCid: damlTypes.ContractId<FailedMint>;
};

export declare const AcceptedMint_Fail_Result:
  damlTypes.Serializable<AcceptedMint_Fail_Result> & {
  }
;


export declare type AcceptedMint_Execute_Result = {
  holdingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  executedMintCid: damlTypes.ContractId<ExecutedMint>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const AcceptedMint_Execute_Result:
  damlTypes.Serializable<AcceptedMint_Execute_Result> & {
  }
;


export declare type MintRequest_Cancel_Result = {
};

export declare const MintRequest_Cancel_Result:
  damlTypes.Serializable<MintRequest_Cancel_Result> & {
  }
;


export declare type MintRequest_Reject_Result = {
  rejectedMintCid: damlTypes.ContractId<RejectedMint>;
};

export declare const MintRequest_Reject_Result:
  damlTypes.Serializable<MintRequest_Reject_Result> & {
  }
;


export declare type MintRequest_Accept_Result = {
  acceptedMintCid: damlTypes.ContractId<AcceptedMint>;
};

export declare const MintRequest_Accept_Result:
  damlTypes.Serializable<MintRequest_Accept_Result> & {
  }
;


export declare type MintOffer_Cancel_Result = {
};

export declare const MintOffer_Cancel_Result:
  damlTypes.Serializable<MintOffer_Cancel_Result> & {
  }
;


export declare type MintOffer_Reject_Result = {
  rejectedMintCid: damlTypes.ContractId<RejectedMint>;
};

export declare const MintOffer_Reject_Result:
  damlTypes.Serializable<MintOffer_Reject_Result> & {
  }
;


export declare type MintOffer_Accept_Result = {
  acceptedMintCid: damlTypes.ContractId<AcceptedMint>;
};

export declare const MintOffer_Accept_Result:
  damlTypes.Serializable<MintOffer_Accept_Result> & {
  }
;


export declare type ExecutedMint_Delete = {
};

export declare const ExecutedMint_Delete:
  damlTypes.Serializable<ExecutedMint_Delete> & {
  }
;


export declare type ExecutedMint_Clean = {
  actor: damlTypes.Party;
};

export declare const ExecutedMint_Clean:
  damlTypes.Serializable<ExecutedMint_Clean> & {
  }
;


export declare type ExecutedMint = {
  mint: Mint;
  holdingLabel: string;
};

export declare interface ExecutedMintInterface {
  ExecutedMint_Clean: damlTypes.Choice<ExecutedMint, ExecutedMint_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedMint, undefined>>;
  Archive: damlTypes.Choice<ExecutedMint, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedMint, undefined>>;
  ExecutedMint_Delete: damlTypes.Choice<ExecutedMint, ExecutedMint_Delete, ExecutedMint_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedMint, undefined>>;
}
export declare const ExecutedMint:
  damlTypes.Template<ExecutedMint, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:ExecutedMint'> &
  damlTypes.ToInterface<ExecutedMint, never> &
  ExecutedMintInterface;

export declare namespace ExecutedMint {
}



export declare type FailedMint_Delete = {
};

export declare const FailedMint_Delete:
  damlTypes.Serializable<FailedMint_Delete> & {
  }
;


export declare type FailedMint_Clean = {
  actor: damlTypes.Party;
};

export declare const FailedMint_Clean:
  damlTypes.Serializable<FailedMint_Clean> & {
  }
;


export declare type FailedMint = {
  mint: Mint;
  reason: string;
};

export declare interface FailedMintInterface {
  FailedMint_Clean: damlTypes.Choice<FailedMint, FailedMint_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedMint, undefined>>;
  FailedMint_Delete: damlTypes.Choice<FailedMint, FailedMint_Delete, FailedMint_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedMint, undefined>>;
  Archive: damlTypes.Choice<FailedMint, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedMint, undefined>>;
}
export declare const FailedMint:
  damlTypes.Template<FailedMint, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:FailedMint'> &
  damlTypes.ToInterface<FailedMint, never> &
  FailedMintInterface;

export declare namespace FailedMint {
}



export declare type RejectedMint_Delete = {
};

export declare const RejectedMint_Delete:
  damlTypes.Serializable<RejectedMint_Delete> & {
  }
;


export declare type RejectedMint_Clean = {
  actor: damlTypes.Party;
};

export declare const RejectedMint_Clean:
  damlTypes.Serializable<RejectedMint_Clean> & {
  }
;


export declare type RejectedMint = {
  mint: Mint;
  reason: string;
};

export declare interface RejectedMintInterface {
  RejectedMint_Clean: damlTypes.Choice<RejectedMint, RejectedMint_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedMint, undefined>>;
  RejectedMint_Delete: damlTypes.Choice<RejectedMint, RejectedMint_Delete, RejectedMint_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedMint, undefined>>;
  Archive: damlTypes.Choice<RejectedMint, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedMint, undefined>>;
}
export declare const RejectedMint:
  damlTypes.Template<RejectedMint, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:RejectedMint'> &
  damlTypes.ToInterface<RejectedMint, never> &
  RejectedMintInterface;

export declare namespace RejectedMint {
}



export declare type AcceptedMint_Fail = {
  reason: string;
};

export declare const AcceptedMint_Fail:
  damlTypes.Serializable<AcceptedMint_Fail> & {
  }
;


export declare type AcceptedMint_Execute = {
  instrumentConfigurationCid: damlTypes.ContractId<Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration>;
  credentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
};

export declare const AcceptedMint_Execute:
  damlTypes.Serializable<AcceptedMint_Execute> & {
  }
;


export declare type AcceptedMint_Clean = {
  actor: damlTypes.Party;
};

export declare const AcceptedMint_Clean:
  damlTypes.Serializable<AcceptedMint_Clean> & {
  }
;


export declare type AcceptedMint = {
  mint: Mint;
  holdingLabel: string;
};

export declare interface AcceptedMintInterface {
  AcceptedMint_Clean: damlTypes.Choice<AcceptedMint, AcceptedMint_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedMint, undefined>>;
  AcceptedMint_Execute: damlTypes.Choice<AcceptedMint, AcceptedMint_Execute, AcceptedMint_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedMint, undefined>>;
  AcceptedMint_Fail: damlTypes.Choice<AcceptedMint, AcceptedMint_Fail, AcceptedMint_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedMint, undefined>>;
  Archive: damlTypes.Choice<AcceptedMint, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedMint, undefined>>;
}
export declare const AcceptedMint:
  damlTypes.Template<AcceptedMint, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:AcceptedMint'> &
  damlTypes.ToInterface<AcceptedMint, never> &
  AcceptedMintInterface;

export declare namespace AcceptedMint {
}



export declare type MintRequest_Cancel = {
};

export declare const MintRequest_Cancel:
  damlTypes.Serializable<MintRequest_Cancel> & {
  }
;


export declare type MintRequest_Reject = {
  reason: string;
};

export declare const MintRequest_Reject:
  damlTypes.Serializable<MintRequest_Reject> & {
  }
;


export declare type MintRequest_Accept = {
};

export declare const MintRequest_Accept:
  damlTypes.Serializable<MintRequest_Accept> & {
  }
;


export declare type MintRequest_Clean = {
  actor: damlTypes.Party;
};

export declare const MintRequest_Clean:
  damlTypes.Serializable<MintRequest_Clean> & {
  }
;


export declare type MintRequest = {
  mint: Mint;
  holdingLabel: string;
};

export declare interface MintRequestInterface {
  MintRequest_Clean: damlTypes.Choice<MintRequest, MintRequest_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintRequest, undefined>>;
  MintRequest_Accept: damlTypes.Choice<MintRequest, MintRequest_Accept, MintRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintRequest, undefined>>;
  MintRequest_Reject: damlTypes.Choice<MintRequest, MintRequest_Reject, MintRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintRequest, undefined>>;
  MintRequest_Cancel: damlTypes.Choice<MintRequest, MintRequest_Cancel, MintRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintRequest, undefined>>;
  Archive: damlTypes.Choice<MintRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintRequest, undefined>>;
}
export declare const MintRequest:
  damlTypes.Template<MintRequest, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:MintRequest'> &
  damlTypes.ToInterface<MintRequest, never> &
  MintRequestInterface;

export declare namespace MintRequest {
}



export declare type MintOffer_Cancel = {
};

export declare const MintOffer_Cancel:
  damlTypes.Serializable<MintOffer_Cancel> & {
  }
;


export declare type MintOffer_Reject = {
  reason: string;
};

export declare const MintOffer_Reject:
  damlTypes.Serializable<MintOffer_Reject> & {
  }
;


export declare type MintOffer_Accept = {
  holdingLabel: string;
};

export declare const MintOffer_Accept:
  damlTypes.Serializable<MintOffer_Accept> & {
  }
;


export declare type MintOffer_Clean = {
  actor: damlTypes.Party;
};

export declare const MintOffer_Clean:
  damlTypes.Serializable<MintOffer_Clean> & {
  }
;


export declare type MintOffer = {
  mint: Mint;
};

export declare interface MintOfferInterface {
  MintOffer_Clean: damlTypes.Choice<MintOffer, MintOffer_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintOffer, undefined>>;
  MintOffer_Accept: damlTypes.Choice<MintOffer, MintOffer_Accept, MintOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintOffer, undefined>>;
  MintOffer_Reject: damlTypes.Choice<MintOffer, MintOffer_Reject, MintOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintOffer, undefined>>;
  MintOffer_Cancel: damlTypes.Choice<MintOffer, MintOffer_Cancel, MintOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintOffer, undefined>>;
  Archive: damlTypes.Choice<MintOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MintOffer, undefined>>;
}
export declare const MintOffer:
  damlTypes.Template<MintOffer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:MintOffer'> &
  damlTypes.ToInterface<MintOffer, never> &
  MintOfferInterface;

export declare namespace MintOffer {
}



export declare type Mint = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  holder: damlTypes.Party;
  reference: string;
  batch: Utility_Registry_V0_Types.Batch;
};

export declare const Mint:
  damlTypes.Serializable<Mint> & {
  }
;

