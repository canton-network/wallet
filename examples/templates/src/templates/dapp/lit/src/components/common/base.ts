// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, LitElement } from 'lit'

export class CantonComponent extends LitElement {
    static override styles = css`
        .actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }

        button {
            padding: 0.5rem 1rem;
            border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
            border-radius: 0.5rem;
            background: transparent;
            color: inherit;
            font: inherit;
            cursor: pointer;
        }

        button.primary {
            border-color: var(--info-color);
            background: var(--info-color);
            color: var(--light-color);
        }

        button:disabled {
            opacity: 0.6;
            cursor: progress;
        }

        h1 {
            margin-top: 0;
        }

        h2 {
            font-size: 1rem;
        }

        dl {
            display: grid;
            grid-template-columns: max-content 1fr;
            gap: 0.25rem 1rem;
        }

        dt {
            font-weight: 600;
        }

        dd {
            margin: 0;
        }

        ul {
            padding: 0;
            list-style: none;
        }

        li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0;
        }

        code {
            overflow-wrap: anywhere;
        }

        .badge {
            padding: 0 0.5rem;
            border-radius: 999px;
            background: color-mix(in srgb, var(--info-color) 20%, transparent);
            font-size: 0.75rem;
            min-width: max-content;
        }

        .muted {
            opacity: 0.7;
        }

        .error {
            color: var(--error-color);
        }
    `
}
