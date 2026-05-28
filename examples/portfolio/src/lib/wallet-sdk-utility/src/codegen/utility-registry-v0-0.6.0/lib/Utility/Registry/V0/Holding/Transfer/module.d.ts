// Generated from Utility/Registry/V0/Holding/Transfer.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff from '@daml.js/daml-stdlib-DA-Set-Types-1.0.0';

import * as Utility_Registry_V0_Configuration_Instrument from '../../../../../Utility/Registry/V0/Configuration/Instrument/module';
import * as Utility_Registry_V0_Types from '../../../../../Utility/Registry/V0/Types/module';

export declare type ExecutedTransfer_Delete_Result = {
};

export declare const ExecutedTransfer_Delete_Result:
  damlTypes.Serializable<ExecutedTransfer_Delete_Result> & {
  }
;


export declare type RejectedTransfer_Delete_Result = {
};

export declare const RejectedTransfer_Delete_Result:
  damlTypes.Serializable<RejectedTransfer_Delete_Result> & {
  }
;


export declare type FailedTransfer_Delete_Result = {
};

export declare const FailedTransfer_Delete_Result:
  damlTypes.Serializable<FailedTransfer_Delete_Result> & {
  }
;


export declare type AcceptedTransfer_Fail_Result = {
  failedTransferCid: damlTypes.ContractId<FailedTransfer>;
};

export declare const AcceptedTransfer_Fail_Result:
  damlTypes.Serializable<AcceptedTransfer_Fail_Result> & {
  }
;


export declare type AcceptedTransfer_Execute_Result = {
  holdingTransferResult: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Transfer_Result;
  executedTransferCid: damlTypes.ContractId<ExecutedTransfer>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const AcceptedTransfer_Execute_Result:
  damlTypes.Serializable<AcceptedTransfer_Execute_Result> & {
  }
;


export declare type TransferRequest_Cancel_Result = {
};

export declare const TransferRequest_Cancel_Result:
  damlTypes.Serializable<TransferRequest_Cancel_Result> & {
  }
;


export declare type TransferRequest_Reject_Result = {
  rejectedTransferCid: damlTypes.ContractId<RejectedTransfer>;
};

export declare const TransferRequest_Reject_Result:
  damlTypes.Serializable<TransferRequest_Reject_Result> & {
  }
;


export declare type TransferRequest_Accept_Result = {
  acceptedTransferCid: damlTypes.ContractId<AcceptedTransfer>;
};

export declare const TransferRequest_Accept_Result:
  damlTypes.Serializable<TransferRequest_Accept_Result> & {
  }
;


export declare type TransferOffer_Cancel_Result = {
};

export declare const TransferOffer_Cancel_Result:
  damlTypes.Serializable<TransferOffer_Cancel_Result> & {
  }
;


export declare type TransferOffer_Reject_Result = {
  rejectedTransferCid: damlTypes.ContractId<RejectedTransfer>;
};

export declare const TransferOffer_Reject_Result:
  damlTypes.Serializable<TransferOffer_Reject_Result> & {
  }
;


export declare type TransferOffer_Accept_Result = {
  acceptedTransferCid: damlTypes.ContractId<AcceptedTransfer>;
};

export declare const TransferOffer_Accept_Result:
  damlTypes.Serializable<TransferOffer_Accept_Result> & {
  }
;


export declare type ExecutedTransfer_Delete = {
};

export declare const ExecutedTransfer_Delete:
  damlTypes.Serializable<ExecutedTransfer_Delete> & {
  }
;


export declare type ExecutedTransfer = {
  transfer: Transfer;
  senderLabel: string;
  receiverLabel: string;
  observers: damlTypes.Optional<pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>>;
  operatorIsObserver: damlTypes.Optional<boolean>;
};

export declare interface ExecutedTransferInterface {
  Archive: damlTypes.Choice<ExecutedTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedTransfer, undefined>>;
  ExecutedTransfer_Delete: damlTypes.Choice<ExecutedTransfer, ExecutedTransfer_Delete, ExecutedTransfer_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ExecutedTransfer, undefined>>;
}
export declare const ExecutedTransfer:
  damlTypes.Template<ExecutedTransfer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:ExecutedTransfer'> &
  damlTypes.ToInterface<ExecutedTransfer, never> &
  ExecutedTransferInterface;

export declare namespace ExecutedTransfer {
}



export declare type FailedTransfer_Delete = {
};

export declare const FailedTransfer_Delete:
  damlTypes.Serializable<FailedTransfer_Delete> & {
  }
;


export declare type FailedTransfer_Clean = {
  actor: damlTypes.Party;
};

export declare const FailedTransfer_Clean:
  damlTypes.Serializable<FailedTransfer_Clean> & {
  }
;


export declare type FailedTransfer = {
  transfer: Transfer;
  reason: string;
  observers: damlTypes.Optional<pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>>;
};

export declare interface FailedTransferInterface {
  FailedTransfer_Clean: damlTypes.Choice<FailedTransfer, FailedTransfer_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedTransfer, undefined>>;
  FailedTransfer_Delete: damlTypes.Choice<FailedTransfer, FailedTransfer_Delete, FailedTransfer_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedTransfer, undefined>>;
  Archive: damlTypes.Choice<FailedTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FailedTransfer, undefined>>;
}
export declare const FailedTransfer:
  damlTypes.Template<FailedTransfer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:FailedTransfer'> &
  damlTypes.ToInterface<FailedTransfer, never> &
  FailedTransferInterface;

export declare namespace FailedTransfer {
}



export declare type RejectedTransfer_Delete = {
};

export declare const RejectedTransfer_Delete:
  damlTypes.Serializable<RejectedTransfer_Delete> & {
  }
;


export declare type RejectedTransfer = {
  transfer: Transfer;
  reason: string;
  observers: damlTypes.Optional<pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>>;
  operatorIsObserver: damlTypes.Optional<boolean>;
};

export declare interface RejectedTransferInterface {
  RejectedTransfer_Delete: damlTypes.Choice<RejectedTransfer, RejectedTransfer_Delete, RejectedTransfer_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedTransfer, undefined>>;
  Archive: damlTypes.Choice<RejectedTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedTransfer, undefined>>;
}
export declare const RejectedTransfer:
  damlTypes.Template<RejectedTransfer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:RejectedTransfer'> &
  damlTypes.ToInterface<RejectedTransfer, never> &
  RejectedTransferInterface;

export declare namespace RejectedTransfer {
}



export declare type AcceptedTransfer_Fail = {
  reason: string;
};

export declare const AcceptedTransfer_Fail:
  damlTypes.Serializable<AcceptedTransfer_Fail> & {
  }
;


export declare type AcceptedTransfer_Execute = {
  instrumentConfigurationCid: damlTypes.ContractId<Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration>;
  senderCredentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
  receiverCredentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
  holdingCid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
};

export declare const AcceptedTransfer_Execute:
  damlTypes.Serializable<AcceptedTransfer_Execute> & {
  }
;


export declare type AcceptedTransfer_Clean = {
  actor: damlTypes.Party;
};

export declare const AcceptedTransfer_Clean:
  damlTypes.Serializable<AcceptedTransfer_Clean> & {
  }
;


export declare type AcceptedTransfer = {
  transfer: Transfer;
  senderLabel: string;
  receiverLabel: string;
  observers: damlTypes.Optional<pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>>;
};

export declare interface AcceptedTransferInterface {
  AcceptedTransfer_Clean: damlTypes.Choice<AcceptedTransfer, AcceptedTransfer_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedTransfer, undefined>>;
  AcceptedTransfer_Execute: damlTypes.Choice<AcceptedTransfer, AcceptedTransfer_Execute, AcceptedTransfer_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedTransfer, undefined>>;
  AcceptedTransfer_Fail: damlTypes.Choice<AcceptedTransfer, AcceptedTransfer_Fail, AcceptedTransfer_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedTransfer, undefined>>;
  Archive: damlTypes.Choice<AcceptedTransfer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AcceptedTransfer, undefined>>;
}
export declare const AcceptedTransfer:
  damlTypes.Template<AcceptedTransfer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:AcceptedTransfer'> &
  damlTypes.ToInterface<AcceptedTransfer, never> &
  AcceptedTransferInterface;

export declare namespace AcceptedTransfer {
}



export declare type TransferRequest_Cancel = {
};

export declare const TransferRequest_Cancel:
  damlTypes.Serializable<TransferRequest_Cancel> & {
  }
;


export declare type TransferRequest_Reject = {
  reason: string;
};

export declare const TransferRequest_Reject:
  damlTypes.Serializable<TransferRequest_Reject> & {
  }
;


export declare type TransferRequest_Accept = {
  senderLabel: string;
};

export declare const TransferRequest_Accept:
  damlTypes.Serializable<TransferRequest_Accept> & {
  }
;


export declare type TransferRequest_Clean = {
  actor: damlTypes.Party;
};

export declare const TransferRequest_Clean:
  damlTypes.Serializable<TransferRequest_Clean> & {
  }
;


export declare type TransferRequest = {
  transfer: Transfer;
  receiverLabel: string;
};

export declare interface TransferRequestInterface {
  TransferRequest_Clean: damlTypes.Choice<TransferRequest, TransferRequest_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRequest, undefined>>;
  TransferRequest_Accept: damlTypes.Choice<TransferRequest, TransferRequest_Accept, TransferRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRequest, undefined>>;
  TransferRequest_Reject: damlTypes.Choice<TransferRequest, TransferRequest_Reject, TransferRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRequest, undefined>>;
  TransferRequest_Cancel: damlTypes.Choice<TransferRequest, TransferRequest_Cancel, TransferRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRequest, undefined>>;
  Archive: damlTypes.Choice<TransferRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferRequest, undefined>>;
}
export declare const TransferRequest:
  damlTypes.Template<TransferRequest, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:TransferRequest'> &
  damlTypes.ToInterface<TransferRequest, never> &
  TransferRequestInterface;

export declare namespace TransferRequest {
}



export declare type TransferOffer_Cancel = {
};

export declare const TransferOffer_Cancel:
  damlTypes.Serializable<TransferOffer_Cancel> & {
  }
;


export declare type TransferOffer_Reject = {
  reason: string;
};

export declare const TransferOffer_Reject:
  damlTypes.Serializable<TransferOffer_Reject> & {
  }
;


export declare type TransferOffer_Accept = {
  receiverLabel: string;
};

export declare const TransferOffer_Accept:
  damlTypes.Serializable<TransferOffer_Accept> & {
  }
;


export declare type TransferOffer_Clean = {
  actor: damlTypes.Party;
};

export declare const TransferOffer_Clean:
  damlTypes.Serializable<TransferOffer_Clean> & {
  }
;


export declare type TransferOffer = {
  transfer: Transfer;
  senderLabel: string;
};

export declare interface TransferOfferInterface {
  TransferOffer_Clean: damlTypes.Choice<TransferOffer, TransferOffer_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferOffer, undefined>>;
  TransferOffer_Accept: damlTypes.Choice<TransferOffer, TransferOffer_Accept, TransferOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferOffer, undefined>>;
  TransferOffer_Reject: damlTypes.Choice<TransferOffer, TransferOffer_Reject, TransferOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferOffer, undefined>>;
  TransferOffer_Cancel: damlTypes.Choice<TransferOffer, TransferOffer_Cancel, TransferOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferOffer, undefined>>;
  Archive: damlTypes.Choice<TransferOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferOffer, undefined>>;
}
export declare const TransferOffer:
  damlTypes.Template<TransferOffer, undefined, '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:TransferOffer'> &
  damlTypes.ToInterface<TransferOffer, never> &
  TransferOfferInterface;

export declare namespace TransferOffer {
}



export declare type Transfer = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  sender: damlTypes.Party;
  receiver: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  reference: string;
  batch: Utility_Registry_V0_Types.Batch;
};

export declare const Transfer:
  damlTypes.Serializable<Transfer> & {
  }
;

