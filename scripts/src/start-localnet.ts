// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { getRepoRoot, getNetworkArg, SUPPORTED_VERSIONS } from './lib/utils.js'

const args = process.argv.slice(2)
const command = args[0]
const multiSync = !args.includes('--no-multi-sync')
const network = getNetworkArg()
const rootDir = getRepoRoot()

// The EnableMultiSynchronizer topology feature flag only exists in Canton >= 3.5.12
// (protocol version 35). On older versions the custom bootstrap script that sets it
// would fail to compile, so there we keep the bundle's default script (the flag is
// not needed on PV < 35 anyway).
const cantonVersion = SUPPORTED_VERSIONS[network].canton.version
const [cantonMajor, cantonMinor, cantonPatch] = cantonVersion
    .split('.')
    .map((n) => parseInt(n, 10))
const cantonSupportsMultiSyncFeatureFlag =
    cantonMajor > 3 ||
    (cantonMajor === 3 && cantonMinor > 5) ||
    (cantonMajor === 3 && cantonMinor === 5 && (cantonPatch ?? 0) >= 12)
const LOCALNET_DIR = path.join(rootDir, '.localnet/docker-compose/localnet')
const GENERATED_COMPOSE_OVERRIDE = path.join(
    rootDir,
    '.temp/start-localnet.override.yaml'
)

const CANTON_MAX_COMMANDS_IN_FLIGHT = 256

// Custom multi-sync bootstrap script
const CUSTOM_APP_SYNCHRONIZER_SC = path.join(
    rootDir,
    'canton/multi-sync/app-synchronizer.sc'
)

function ensureComposeOverride() {
    fs.mkdirSync(path.dirname(GENERATED_COMPOSE_OVERRIDE), { recursive: true })
    fs.writeFileSync(
        GENERATED_COMPOSE_OVERRIDE,
        [
            'services:',
            '  canton:',
            '    environment:',
            '      ADDITIONAL_CONFIG_MAX_COMMANDS_IN_FLIGHT: |-',
            `        canton.participants.app-provider.ledger-api.command-service.max-commands-in-flight = ${CANTON_MAX_COMMANDS_IN_FLIGHT}`,
            `        canton.participants.app-user.ledger-api.command-service.max-commands-in-flight = ${CANTON_MAX_COMMANDS_IN_FLIGHT}`,
            `        canton.participants.sv.ledger-api.command-service.max-commands-in-flight = ${CANTON_MAX_COMMANDS_IN_FLIGHT}`,
            ...(multiSync && cantonSupportsMultiSyncFeatureFlag
                ? [
                      '  multi-sync-startup:',
                      '    volumes:',
                      `      - ${CUSTOM_APP_SYNCHRONIZER_SC}:/app/app-synchronizer.sc`,
                  ]
                : []),
            '',
        ].join('\n'),
        'utf8'
    )
}

const composeBase = [
    'docker',
    'compose',
    '--env-file',
    `${LOCALNET_DIR}/compose.env`,
    '--env-file',
    `${LOCALNET_DIR}/env/common.env`,
    '-f',
    `${LOCALNET_DIR}/compose.yaml`,
    '-f',
    `${LOCALNET_DIR}/resource-constraints.yaml`,
    '-f',
    GENERATED_COMPOSE_OVERRIDE,
    '--profile',
    'sv',
    '--profile',
    'app-provider',
    '--profile',
    'app-user',
    ...(multiSync ? ['--profile', 'multi-sync'] : []),
]

const spliceVersion = SUPPORTED_VERSIONS[network].splice.version

// Set IMAGE_TAG env variable to SPLICE_VERSION
const env = { ...process.env, IMAGE_TAG: spliceVersion }

ensureComposeOverride()

if (command === 'pull') {
    execFileSync(composeBase[0], [...composeBase.slice(1), 'pull'], {
        stdio: 'inherit',
        env,
    })
} else if (command === 'start') {
    try {
        execFileSync(composeBase[0], [...composeBase.slice(1), 'up', '-d'], {
            stdio: 'inherit',
            env,
        })
    } catch (err) {
        // `up -d` hides the logs of a dependency that exits non-zero (e.g. the
        // multi-sync-startup bootstrap console). Surface them so CI failures are
        // debuggable instead of just reporting "exit 1".
        console.error(
            '\n=== localnet start failed; dumping multi-sync-startup logs ==='
        )
        try {
            execFileSync(
                composeBase[0],
                [...composeBase.slice(1), 'logs', 'multi-sync-startup'],
                { stdio: 'inherit', env }
            )
        } catch {
            // ignore errors while fetching logs
        }
        throw err
    }
} else if (command === 'stop') {
    execFileSync(composeBase[0], [...composeBase.slice(1), 'down', '-v'], {
        stdio: 'inherit',
        env,
    })
} else {
    console.error('Usage: start-localnet.ts <start|stop|pull>')
    process.exit(1)
}
