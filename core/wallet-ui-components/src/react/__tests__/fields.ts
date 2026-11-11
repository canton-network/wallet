// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, type userEvent } from 'storybook/test'

/**
 * Replaces the text of an input inside a shadow root, as a user would by
 * selecting it, typing over it and moving on.
 *
 * Some fields only take their value on `change`, which the browser fires once
 * an edited field loses focus. user-event can't see focus move inside a shadow
 * root, so it neither clears such an input nor fires `change`; this selects
 * the text, types over it and fires `change` the way the browser would
 */
export const fillField = async (
    user: ReturnType<typeof userEvent.setup>,
    field: HTMLElement,
    text: string
) => {
    // user-event keeps its own record of the selection from the last time it
    // typed into the field, so the selection has to go through it too
    field.focus()
    await user.type(field, `{Backspace}${text}`, {
        skipClick: true,
        initialSelectionStart: 0,
        initialSelectionEnd: (field as HTMLInputElement).value.length,
    })
    fireEvent.change(field)
}
