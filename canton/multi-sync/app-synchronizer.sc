// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

bootstrap.synchronizer(
  synchronizerName = "app-synchronizer",
  sequencers = Seq(`app-sequencer`),
  mediators = Seq(`app-mediator`),
  synchronizerOwners = Seq(`app-sequencer`),
  synchronizerThreshold = 1,
  staticSynchronizerParameters = StaticSynchronizerParameters.defaultsWithoutKMS(ProtocolVersion.latest),
)

// Connect app-user and app-provider to the new synchronizer.
//   app-user     — global + app-synchronizer
//   app-provider — global + app-synchronizer
//   sv           — global only (TradingApp is only an observer of Token Allocations;
//                  it learns about them when they are reassigned to global before settlement)
//
// The global domain is connected first (before this bootstrap script runs),
// so connectedSynchronizers[0] remains global for all participants — the
// default synchronizer selection is unaffected.
`app-provider`.synchronizers.connect_local(`app-sequencer`, "app-synchronizer")
`app-user`.synchronizers.connect_local(`app-sequencer`, "app-synchronizer")

// Wait for both participants to be active on app-synchronizer
utils.retry_until_true {
  `app-provider`.synchronizers.active("app-synchronizer") &&
    `app-user`.synchronizers.active("app-synchronizer")
}

logger.info("app-synchronizer bootstrap with package vetting completed successfully for app-provider and app-user")
