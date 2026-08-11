// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'

import fs from 'node:fs'
import path from 'node:path'
import dts from 'rollup-plugin-dts'

const TEST_TOKEN_V1_BASE = path.resolve(
    import.meta.dirname,
    '../../damljs/test-token-v1'
)
const TEST_TOKEN_V2_BASE = path.resolve(
    import.meta.dirname,
    '../../damljs/test-token-v2'
)

function buildDamlJsPackagesMap(baseDir) {
    const packages = {}
    if (!fs.existsSync(baseDir)) {
        return packages
    }
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

const DAML_JS_PACKAGES = {
    ...buildDamlJsPackagesMap(TEST_TOKEN_V1_BASE),
    ...buildDamlJsPackagesMap(TEST_TOKEN_V2_BASE),
}
const TEST_TOKEN_V1_COMPAT_ALIAS = '@daml.js/test-token-v1'
const TEST_TOKEN_V1_CANONICAL_NAME = '@daml.js/splice-test-token-v1-1.0.0'
const TEST_TOKEN_V2_COMPAT_ALIAS = '@daml.js/test-token-v2'
const TEST_TOKEN_V2_CANONICAL_NAME = '@daml.js/splice-test-token-v2-1.0.0'

if (DAML_JS_PACKAGES[TEST_TOKEN_V1_CANONICAL_NAME]) {
    DAML_JS_PACKAGES[TEST_TOKEN_V1_COMPAT_ALIAS] =
        DAML_JS_PACKAGES[TEST_TOKEN_V1_CANONICAL_NAME]
}
if (DAML_JS_PACKAGES[TEST_TOKEN_V2_CANONICAL_NAME]) {
    DAML_JS_PACKAGES[TEST_TOKEN_V2_COMPAT_ALIAS] =
        DAML_JS_PACKAGES[TEST_TOKEN_V2_CANONICAL_NAME]
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
    const entries = []
    for (const [name, pkgDir] of Object.entries(packageDirs)) {
        const pkgJson = JSON.parse(
            fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
        )
        const mainAbs = path.resolve(pkgDir, pkgJson.main || 'lib/index.js')
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        // Sub-path must come before main to avoid premature matching
        entries.push({
            find: new RegExp(`^${escapedName}/(.+)$`),
            replacement: `${pkgDir}/$1`,
        })
        entries.push({ find: name, replacement: mainAbs })
    }
    return entries
}

const pathsMap = buildPathsMap(DAML_JS_PACKAGES)
const damlJsAlias = alias({ entries: buildAliasEntries(DAML_JS_PACKAGES) })
const commonjsPlugin = commonjs({
    transformMixedEsModules: true,
    esmExternals: true,
    requireReturnsDefault: false,
})

const pkgPath = path.resolve(process.cwd(), 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

// Collect deps + peerDeps (but not devDeps, or excepted ones)
const exceptions = [
    '@daml/types',
    '@daml/ledger',
    '@mojotech/json-type-validation',
]
const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
].filter((dep) => !exceptions.includes(dep))

// bundle ESM
const codeEsm = {
    input: 'src/index.ts',
    output: { file: 'dist/index.js', format: 'es', sourcemap: true },
    external,
    plugins: [damlJsAlias, json(), commonjsPlugin, nodeResolve(), typescript()],
}

// bundle CJS
const codeCjs = {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.cjs',
        format: 'cjs',
        interop: 'auto',
        sourcemap: true,
        exports: 'named',
    },
    external,
    plugins: [damlJsAlias, json(), commonjsPlugin, nodeResolve(), typescript()],
}

// bundle for browser
const codeBrowser = {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.browser.js',
        format: 'es',
        sourcemap: true,
    },
    external,
    plugins: [
        damlJsAlias,
        json(),
        commonjsPlugin,
        nodeResolve({
            browser: true, // Prefer browser entrypoints
            preferBuiltins: false, // Do NOT use Node builtins
        }),
        typescript(),
    ],
}

// bundle DTS including types from codegen
const types = {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [
        dts({
            respectExternal: false,
            compilerOptions: {
                baseUrl: '.',
                paths: pathsMap,
                declaration: true,
                emitDeclarationOnly: true,
            },
        }),
    ],
}

export default [codeEsm, codeCjs, codeBrowser, types]
