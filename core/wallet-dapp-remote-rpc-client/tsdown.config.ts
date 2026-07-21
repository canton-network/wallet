import { defineConfig } from 'tsdown'
import { base } from '../../tsdown.base.ts'

export default defineConfig({
    ...base,
    entry: ['src/index.ts'],
    outputOptions: {
        exports: 'named',
    },
})
