// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Custom multi-sync bootstrap for LocalNet. Mounted over the fetched bundle's
// /app/app-synchronizer.sc by scripts/src/start-localnet.ts so the change
// survives a `yarn script:fetch:localnet` (the .localnet bundle is gitignored).
//
// In addition to bootstrapping the private app-synchronizer and connecting the
// app-provider and app-user participants, this enables the
// EnableMultiSynchronizer topology feature flag on both participants for the
// app- and global synchronizers. Protocol version 35 (the latest stable PV in
// Canton 3.5.8) enforces this flag for cross-synchronizer reassignment; without
// it the DvP settlement in example 17 / run-17 fails with
// "Multi-synchronizer feature flag is not enabled for synchronizer ...".

val appSynchronizerId = bootstrap.synchronizer(
  synchronizerName = "app-synchronizer",
  sequencers = Seq(`app-sequencer`),
  mediators = Seq(`app-mediator`),
  synchronizerOwners = Seq(`app-sequencer`),
  synchronizerThreshold = 1,
  staticSynchronizerParameters = StaticSynchronizerParameters.defaultsWithoutKMS(ProtocolVersion.latest),
).logical

`app-provider`.synchronizers.connect_local(`app-sequencer`, "app-synchronizer")
`app-user`.synchronizers.connect_local(`app-sequencer`, "app-synchronizer")

utils.retry_until_true {
  `app-provider`.synchronizers.active("app-synchronizer") &&
    `app-user`.synchronizers.active("app-synchronizer")
}

// Enable the multi-synchronizer topology feature flag so contracts can be
// reassigned across the app- and global synchronizers (required for DvP flows).
val globalSynchronizerId = `app-provider`.synchronizers.list_connected()
  .map(_.synchronizerId)
  .filter(_ != appSynchronizerId)
  .headOption
  .getOrElse(sys.error("global synchronizer not connected on app-provider"))

val multiSyncFeatureFlag =
  Seq(SynchronizerTrustCertificate.ParticipantTopologyFeatureFlag.EnableMultiSynchronizer)
Seq(appSynchronizerId, globalSynchronizerId).foreach { sid =>
  `app-provider`.topology.synchronizer_trust_certificates
    .propose(`app-provider`, sid, featureFlags = multiSyncFeatureFlag)
  `app-user`.topology.synchronizer_trust_certificates
    .propose(`app-user`, sid, featureFlags = multiSyncFeatureFlag)
}
