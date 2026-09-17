// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'rolldown'
import { esmExternalRequirePlugin } from 'rolldown/plugins'
import { dts } from 'rolldown-plugin-dts'

import fs from 'node:fs'
import path from 'node:path'

const TEST_TOKEN_BASE = path.resolve(
    import.meta.dirname,
    '../../damljs/splice-test-token-v1'
)

const OTC_TRADE_BASE = path.resolve(
    import.meta.dirname,
    '../../damljs/splice-token-test-trading-app'
)

function buildDamlJsPackagesMap(baseDir) {
    const packages = {}
    const entries = fs.readdirSync(baseDir, { withFileTypes: true })

    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue
        }

        const pkgDir = path.join(baseDir, entry.name)
        const pkgJsonPath = path.join(pkgDir, 'package.json')

        if (!fs.existsSync(pkgJsonPath)) {
            continue
        }

        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
        if (typeof pkgJson.name !== 'string') {
            continue
        }

        if (!pkgJson.name.startsWith('@daml.js/')) {
            continue
        }

        packages[pkgJson.name] = pkgDir
    }

    return packages
}

const TEST_TOKEN_COMPAT_ALIAS = '@daml.js/test-token-v1'
const TEST_TOKEN_CANONICAL_PREFIX = '@daml.js/splice-test-token-v1'
const OTC_TRADE_COMPAT_ALIAS = '@daml.js/otc-trade'
const OTC_TRADE_CANONICAL_PREFIX = '@daml.js/splice-token-test-trading-app'

const DAML_JS_PACKAGES = {
    testToken: buildDamlJsPackagesMap(TEST_TOKEN_BASE),
    otcTrade: buildDamlJsPackagesMap(OTC_TRADE_BASE),
}

// Flatten DAML_JS_PACKAGES into a single map for rolldown config
const allDamlJsPackages = {
    ...DAML_JS_PACKAGES.testToken,
    ...DAML_JS_PACKAGES.otcTrade,
}

function findPackageDirByPrefix(packages, prefix) {
    const packageName = Object.keys(packages).find((name) =>
        name.startsWith(prefix)
    )

    return packageName ? packages[packageName] : undefined
}

// Add compatibility aliases
const testTokenCompatTarget = findPackageDirByPrefix(
    DAML_JS_PACKAGES.testToken,
    TEST_TOKEN_CANONICAL_PREFIX
)

if (testTokenCompatTarget) {
    allDamlJsPackages[TEST_TOKEN_COMPAT_ALIAS] = testTokenCompatTarget
}

const otcTradeCompatTarget = findPackageDirByPrefix(
    DAML_JS_PACKAGES.otcTrade,
    OTC_TRADE_CANONICAL_PREFIX
)

if (otcTradeCompatTarget) {
    allDamlJsPackages[OTC_TRADE_COMPAT_ALIAS] = otcTradeCompatTarget
}

function buildPathsMap(packageDirs) {
    const map = {}
    for (const [name, pkgDir] of Object.entries(packageDirs)) {
        const pkgJson = JSON.parse(
            fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
        )
        const typesRel = pkgJson.types || pkgJson.typings || 'lib/index.d.ts'
        const typesAbs = path.resolve(pkgDir, typesRel)
        const libDir = path.resolve(pkgDir, 'lib')
        map[name] = [typesAbs]
        map[`${name}/*`] = [path.join(libDir, '*')]

        // Force deep "module.js" -> ".d.ts" resolution so dts can inline
        map[`${name}/lib/*/module.js`] = [path.join(libDir, '*/module.d.ts')]
        map[`${name}/lib/*/index.js`] = [path.join(libDir, '*/index.d.ts')]
    }
    return map
}

function buildAliasEntries(packageDirs) {
    const entries = {
        lodash: path.resolve(process.cwd(), 'node_modules/lodash/lodash.js'),
        'lodash.isequal': path.resolve(
            process.cwd(),
            'node_modules/lodash.isequal/index.js'
        ),
        '@mojotech/json-type-validation': path.resolve(
            process.cwd(),
            'node_modules/@mojotech/json-type-validation/dist/index.es5.js'
        ),
    }
    for (const [name, pkgDir] of Object.entries(packageDirs)) {
        const pkgJson = JSON.parse(
            fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
        )
        const mainAbs = path.resolve(pkgDir, pkgJson.main || 'lib/index.js')
        entries[`${name}/`] = `${pkgDir}/`
        entries[name] = mainAbs
    }
    return entries
}

function resolveGeneratedDependencies() {
    const resolved = {
        lodash: path.resolve(process.cwd(), 'node_modules/lodash/lodash.js'),
        '@mojotech/json-type-validation': path.resolve(
            process.cwd(),
            'node_modules/@mojotech/json-type-validation/dist/index.es5.js'
        ),
    }
    return {
        name: 'resolve-generated-dependencies',
        resolveId(source) {
            return resolved[source]
        },
    }
}

function promoteDeclarationBundle() {
    return {
        name: 'promote-declaration-bundle',
        writeBundle() {
            const typesDir = path.resolve(process.cwd(), 'dist/types')
            const declaration = fs
                .readdirSync(typesDir)
                .filter((file) => file.endsWith('.d.ts'))
                .map((file) => ({
                    file,
                    text: fs.readFileSync(path.join(typesDir, file), 'utf8'),
                }))
                .find(({ text }) => text.trim() !== 'export {}')

            if (!declaration) {
                throw new Error('No declaration bundle was generated')
            }

            fs.writeFileSync(
                path.resolve(process.cwd(), 'dist/index.d.ts'),
                declaration.text
            )
        },
    }
}

const pathsMap = buildPathsMap(allDamlJsPackages)
const aliasEntries = buildAliasEntries(allDamlJsPackages)

const pkgPath = path.resolve(process.cwd(), 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

// Keep runtime dependencies external for Node-compatible ESM and CJS builds.
const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    // Transitive dependencies from damljs packages
    '@daml/types',
    '@daml/ledger',
    // Node built-ins
    'node:fs',
    'node:url',
    'node:path',
].filter((dep) => dep !== '@mojotech/json-type-validation')

const dtsExternal = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    '@daml/ledger',
]
const browserExternal = external.filter((dep) => !dep.startsWith('node:'))

const base = {
    input: 'src/index.ts',
    external,
    platform: 'neutral',
    resolve: { alias: aliasEntries },
    plugins: [resolveGeneratedDependencies()],
}

export default defineConfig([
    {
        ...base,
        output: {
            file: 'dist/index.js',
            format: 'es',
            sourcemap: true,
            codeSplitting: false,
        },
    },
    {
        ...base,
        output: {
            file: 'dist/index.cjs',
            format: 'cjs',
            sourcemap: true,
            exports: 'named',
            codeSplitting: false,
        },
    },
    {
        ...base,
        external: [],
        output: {
            file: 'dist/index.browser.js',
            format: 'es',
            sourcemap: true,
            codeSplitting: false,
        },
        platform: 'browser',
        plugins: [
            resolveGeneratedDependencies(),
            esmExternalRequirePlugin({ external: browserExternal }),
        ],
    },
    {
        input: 'src/index.ts',
        external: dtsExternal,
        output: {
            dir: 'dist/types',
            format: 'es',
        },
        plugins: [
            ...dts({
                generator: 'tsc',
                resolver: 'tsc',
                emitDtsOnly: true,
                compilerOptions: {
                    baseUrl: '.',
                    paths: pathsMap,
                    declaration: true,
                    emitDeclarationOnly: true,
                },
            }),
            promoteDeclarationBundle(),
        ],
    },
])
