// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export * from './_proto/com/digitalasset/canton/crypto/v30/crypto.ts'
export * from './_proto/com/digitalasset/canton/protocol/v30/topology.ts'
// Canton 3.7 (protocol version 37) adds v31 topology transactions, which differ from v30 only in
// PartyToParticipant. A namespace, as its message names clash with the v30 ones above.
export * as v31 from './_proto/com/digitalasset/canton/protocol/v31/topology.ts'
export { UntypedVersionedMessage } from './_proto/com/digitalasset/canton/version/v1/untyped_versioned_message.ts'
export { TopologyManagerWriteServiceClient } from './_proto/com/digitalasset/canton/topology/admin/v30/topology_manager_write_service.client.ts'
export * from './_proto/com/digitalasset/canton/topology/admin/v30/topology_manager_write_service.ts'
export * from './_proto/com/digitalasset/canton/topology/admin/v30/topology_manager_read_service.ts'
export * from './_proto/com/digitalasset/canton/topology/admin/v30/common.ts'
export {
    DamlTransaction,
    DamlTransaction_Node,
    DamlTransaction_NodeSeed,
    HashingSchemeVersion,
    Metadata,
    Metadata_InputContract,
    PreparedTransaction,
} from './_proto/com/daml/ledger/api/v2/interactive/interactive_submission_service.ts'

export {
    Create,
    Exercise,
    Fetch,
    Rollback,
} from './_proto/com/daml/ledger/api/v2/interactive/transaction/v1/interactive_submission_data.ts'
export {
    GenMap_Entry,
    Identifier,
    RecordField,
    TextMap_Entry,
    Value,
} from './_proto/com/daml/ledger/api/v2/value.ts'

export { TopologyManagerReadServiceClient } from './_proto/com/digitalasset/canton/topology/admin/v30/topology_manager_read_service.client.ts'
export {
    BaseQuery,
    ListPartyToParticipantRequest,
} from './_proto/com/digitalasset/canton/topology/admin/v30/topology_manager_read_service.ts'
export { Empty } from './_proto/google/protobuf/empty.ts'
export { ErrorInfo, RetryInfo } from './_proto/google/rpc/error_details.ts'

export {
    decodeUnknownFields,
    type RawFields,
    type RawValue,
} from './unknown-fields.ts'
