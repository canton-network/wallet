// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Command, Option } from '@commander-js/extra-typings'
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { getRepoRoot, SUPPORTED_VERSIONS, type Network } from './lib/utils.js'

const rootDir = getRepoRoot()
const LOCALNET_DIR = path.join(rootDir, '.localnet/docker-compose/localnet')
const GENERATED_COMPOSE_OVERRIDE = path.join(
    rootDir,
    '.temp/start-localnet.override.yaml'
)

const CANTON_MAX_COMMANDS_IN_FLIGHT = 256

const SCAN_CACHED_BY_PARTY_TTL = '1s'

// Custom multi-sync bootstrap script
const CUSTOM_APP_SYNCHRONIZER_SC = path.join(
    rootDir,
    'canton/multi-sync/app-synchronizer.sc'
)

// The EnableMultiSynchronizer topology feature flag exists under this name since
// Canton 3.5.4 (renamed from EnableAlphaMultiSynchronizer). On older versions the
// custom bootstrap script that sets it would fail to compile, so there we keep the
// bundle's default script (the flag is not needed on PV < 35 anyway). Note that PV 35
// (default since Canton 3.5.8, incl. mainnet's 3.5.10) *enforces* the flag for
// cross-synchronizer reassignment, so the script must be mounted on those versions.
function cantonSupportsMultiSyncFeatureFlag(network: Network): boolean {
    const [cantonMajor, cantonMinor, cantonPatch] = SUPPORTED_VERSIONS[
        network
    ].canton.version
        .split('.')
        .map((n) => parseInt(n, 10))
    return (
        cantonMajor > 3 ||
        (cantonMajor === 3 && cantonMinor > 5) ||
        (cantonMajor === 3 && cantonMinor === 5 && (cantonPatch ?? 0) >= 4)
    )
}

function ensureComposeOverride(network: Network, multiSync: boolean) {
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
            '  splice:',
            '    environment:',
            '      ADDITIONAL_CONFIG_SCAN_CACHE: |-',
            `        canton.scan-apps.scan-app.cache.cached-by-party { ttl = ${SCAN_CACHED_BY_PARTY_TTL}, max-size = 2000 }`,
            ...(multiSync && cantonSupportsMultiSyncFeatureFlag(network)
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

interface ComposeOptions {
    network: Network
    multiSync: boolean
}

function compose(
    { network, multiSync }: ComposeOptions,
    args: string[],
    options: { stdio?: 'inherit' } = { stdio: 'inherit' }
): string {
    ensureComposeOverride(network, multiSync)
    return execFileSync('docker', [...composeArgs(multiSync), ...args], {
        ...options,
        encoding: 'utf8',
        env: {
            ...process.env,
            IMAGE_TAG: SUPPORTED_VERSIONS[network].splice.version,
        },
    })
}

const composeArgs = (multiSync: boolean) => [
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

const program = new Command()
    .description('Manage the LocalNet docker compose environment')
    .addOption(
        new Option('--network <network>', 'network to run against')
            .choices(['devnet', 'mainnet'] as const)
            .default('devnet' as const)
    )
    .option('--no-multi-sync', 'disable the multi-sync profile')

program
    .command('start')
    .description('start LocalNet in the background')
    .action(() => {
        const opts = program.opts()
        try {
            // Pass `--build` so the locally-built `console`/`multi-sync-startup`
            // image is rebuilt against the *current* canton:${IMAGE_TAG} base.
            compose(opts, ['up', '-d', '--build'])
        } catch (err) {
            // `up -d` hides the logs of a dependency that exits non-zero (e.g. the
            // multi-sync-startup bootstrap console). Surface them so CI failures are
            // debuggable instead of just reporting "exit 1".
            console.error(
                '\n=== localnet start failed; dumping multi-sync-startup logs ==='
            )
            try {
                compose(opts, ['logs', 'multi-sync-startup'])
            } catch {
                // ignore errors while fetching logs
            }
            throw err
        }
    })

program
    .command('stop')
    .description('stop LocalNet and remove its volumes')
    .action(() => {
        compose(program.opts(), ['down', '-v'])
    })

program
    .command('pull')
    .description('pull the LocalNet docker images')
    .action(() => {
        compose(program.opts(), ['pull'])
    })

program
    .command('save-images')
    .description('save the pulled LocalNet docker images into a tarball')
    .requiredOption('--output <file>', 'tarball to write')
    .action(({ output }) => {
        const config = JSON.parse(
            compose(program.opts(), ['config', '--format', 'json'], {})
        ) as { services: Record<string, { image?: string }> }
        const images = Object.values(config.services)
            .map(({ image }) => image)
            .filter((image) => image !== undefined)
        fs.mkdirSync(path.dirname(output), { recursive: true })
        execFileSync('docker', ['save', '-o', output, ...images], {
            stdio: 'inherit',
        })
    })

program.parse()
