// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type IntentSegment =
    | { kind: 'text'; text: string }
    | { kind: 'placeholder'; path: string }

/**
 * Splits an interpolated intent into literal text and `{path}` placeholders. `{{` and `}}` are literal
 * braces. A placeholder ends at the first `}` outside a quoted map key, so a key may contain `}`.
 */
export function parseIntent(intent: string): IntentSegment[] {
    const segments: IntentSegment[] = []
    let text = ''
    for (let i = 0; i < intent.length; i++) {
        const c = intent[i]
        const doubled = intent[i + 1] === c
        if ((c === '{' || c === '}') && doubled) {
            text += c
            i++
            continue
        }
        if (c === '}') {
            throw new Error(`unmatched '}' at offset ${i}`)
        }
        if (c !== '{') {
            text += c
            continue
        }
        const end = placeholderEnd(intent, i + 1)
        if (text !== '') {
            segments.push({ kind: 'text', text })
            text = ''
        }
        segments.push({ kind: 'placeholder', path: intent.slice(i + 1, end) })
        i = end
    }
    if (text !== '') {
        segments.push({ kind: 'text', text })
    }
    return segments
}

function placeholderEnd(intent: string, start: number): number {
    let inString = false
    for (let j = start; j < intent.length; j++) {
        const c = intent[j]
        if (inString && c === '\\') {
            j++
        } else if (c === '"') {
            inString = !inString
        } else if (!inString && c === '}') {
            return j
        }
    }
    throw new Error(`unterminated placeholder at offset ${start - 1}`)
}
