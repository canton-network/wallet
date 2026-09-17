// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as OtcTradePackage from '@daml.js/otc-trade'

const { Splice } = OtcTradePackage

export const packageId = OtcTradePackage.packageId
export const TradingApp = Splice.Testing.Apps.TradingApp
