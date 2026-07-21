// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OperationHandler, Operations } from '../../openapi-ts/allocation-v1'
import { APIOperationHandler } from '../../types'

export type AllocationAPIHandler<operationId extends keyof Operations> =
    APIOperationHandler<OperationHandler<operationId>>
