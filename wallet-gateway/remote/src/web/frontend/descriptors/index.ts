// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Descriptor } from '@canton-network/core-tx-clear-signing'
import { BaseElement } from '@canton-network/core-wallet-ui-components'
import { css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import '../index'
import {
    addDescriptor,
    listDescriptors,
    removeDescriptor,
} from '../descriptors-store.ts'
import { showToast } from '../utils.ts'

function choiceLabel(entry: unknown): string {
    if (entry === null || typeof entry !== 'object') return ''
    const choice = 'choice' in entry ? entry.choice : undefined
    if (typeof choice !== 'string') return ''
    const iface = 'interface' in entry ? entry.interface : undefined
    if (iface === null || typeof iface !== 'object') return choice
    const moduleName = 'moduleName' in iface ? iface.moduleName : undefined
    const entityName = 'entityName' in iface ? iface.entityName : undefined
    return typeof moduleName === 'string' && typeof entityName === 'string'
        ? `${choice} via ${moduleName}:${entityName}`
        : choice
}

function fileOrigin(file: File): string {
    return file.webkitRelativePath || file.name
}

@customElement('user-ui-descriptors')
export class UserUiDescriptors extends BaseElement {
    @state() accessor descriptors: Descriptor[] = []
    @state() accessor pasted = ''
    /** Why the last upload was rejected, one line per problem. */
    @state() accessor problems: string[] = []
    @state() accessor loadError = ''

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: block;
                max-width: 900px;
                margin: 0 auto;
            }

            .upload,
            .descriptor {
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-2);
                padding: var(--wg-space-4);
                margin-bottom: var(--wg-space-4);
                border: 1px solid var(--wg-border);
                border-radius: var(--wg-radius-lg);
            }

            .descriptor-heading {
                display: flex;
                align-items: baseline;
                gap: var(--wg-space-2);
            }

            dl {
                display: grid;
                grid-template-columns: minmax(0, 8.5rem) minmax(0, 1fr);
                gap: var(--wg-space-1) var(--wg-space-3);
                margin: 0;
            }

            dd {
                margin: 0;
                word-break: break-word;
            }

            .identifier,
            pre {
                font-family: var(--bs-font-monospace);
                font-size: var(--wg-font-size-sm);
            }

            textarea {
                font-family: var(--bs-font-monospace);
            }
        `,
    ]

    connectedCallback(): void {
        super.connectedCallback()
        void this.reload()
    }

    private async reload() {
        try {
            this.descriptors = await listDescriptors()
            this.loadError = ''
        } catch (error) {
            this.descriptors = []
            this.loadError =
                error instanceof Error ? error.message : String(error)
        }
    }

    /** Stores one descriptor. A failure is recorded against `origin` and does not stop a batch. */
    private async storeOne(json: unknown, origin: string): Promise<boolean> {
        try {
            await addDescriptor(json)
            return true
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error)
            this.problems = [...this.problems, `${origin}: ${message}`]
            return false
        }
    }

    private async addPasted() {
        this.problems = []
        try {
            const json: unknown = JSON.parse(this.pasted)
            if (await this.storeOne(json, 'pasted JSON')) {
                this.pasted = ''
                const name =
                    json !== null &&
                    typeof json === 'object' &&
                    'metadata' in json &&
                    json.metadata !== null &&
                    typeof json.metadata === 'object' &&
                    'name' in json.metadata &&
                    typeof json.metadata.name === 'string'
                        ? json.metadata.name
                        : 'descriptor'
                showToast('', `Added '${name}' (pasted JSON)`, 'success')
            }
        } catch {
            this.problems = ['pasted JSON: not valid JSON']
        }
        await this.reload()
    }

    private async addFiles(e: Event) {
        const input = e.target as HTMLInputElement
        await this.addBatch(Array.from(input.files ?? []))
        input.value = ''
    }

    private async addDirectory(e: Event) {
        const input = e.target as HTMLInputElement
        const files = Array.from(input.files ?? []).filter((file) =>
            file.name.toLowerCase().endsWith('.json')
        )
        if (files.length === 0) {
            this.problems = ['no JSON files in that directory']
            input.value = ''
            return
        }
        await this.addBatch(files)
        input.value = ''
    }

    private async addBatch(files: File[]) {
        this.problems = []
        let added = 0
        for (const file of files) {
            const origin = fileOrigin(file)
            try {
                if (
                    await this.storeOne(JSON.parse(await file.text()), origin)
                ) {
                    added++
                }
            } catch {
                this.problems = [...this.problems, `${origin}: not valid JSON`]
            }
        }
        const rejected = this.problems.length
        showToast(
            '',
            `Added ${added}, ${rejected} rejected`,
            rejected === 0 ? 'success' : 'error'
        )
        await this.reload()
    }

    private async deleteUpload(d: Descriptor) {
        try {
            await removeDescriptor(d)
            showToast(
                '',
                `Removed '${d.metadata?.name ?? 'descriptor'}'`,
                'success'
            )
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error)
            this.problems = [message]
        }
        await this.reload()
    }

    protected render() {
        return html`
            <h1 class="h4 fw-semibold">Clear-signing descriptors</h1>
            <p class="text-body-secondary small">
                Descriptors are stored for your account and start empty. An
                upload is kept when it names a template and every signature on
                it verifies against the public key in that signature. At least
                one signature is required. One for the same package, module and
                entity replaces the stored one, so two package versions of a
                template can both be kept. The approve page accepts a stored
                descriptor when those signatures are from a trusted key. A
                descriptor that is not valid, or not signed by a trusted key, is
                reported there and does not supply the sentence.
            </p>

            <section class="upload">
                <label class="form-label mb-0" for="descriptor-files"
                    >Upload descriptor files</label
                >
                <input
                    id="descriptor-files"
                    class="form-control"
                    type="file"
                    accept=".json,application/json"
                    multiple
                    @change=${this.addFiles}
                />
                <label class="form-label mb-0" for="descriptor-directory"
                    >Upload a directory</label
                >
                <input
                    id="descriptor-directory"
                    class="form-control"
                    type="file"
                    webkitdirectory
                    multiple
                    @change=${this.addDirectory}
                />
                <label class="form-label mb-0" for="descriptor-json"
                    >Or paste descriptor JSON</label
                >
                <textarea
                    id="descriptor-json"
                    class="form-control"
                    rows="6"
                    .value=${this.pasted}
                    @input=${(e: Event) =>
                        (this.pasted = (e.target as HTMLTextAreaElement).value)}
                ></textarea>
                <div>
                    <button
                        class="btn btn-primary btn-sm rounded-pill"
                        type="button"
                        ?disabled=${!this.pasted.trim()}
                        @click=${this.addPasted}
                    >
                        Add
                    </button>
                </div>
                ${
                    this.loadError
                        ? html`<div
                              class="alert alert-danger small mb-0"
                              role="alert"
                          >
                              ${this.loadError}
                          </div>`
                        : nothing
                }
                ${
                    this.problems.length
                        ? html`<div
                              class="alert alert-danger small mb-0"
                              role="alert"
                          >
                              <ul class="mb-0">
                                  ${this.problems.map((p) => html`<li>${p}</li>`)}
                              </ul>
                          </div>`
                        : nothing
                }
            </section>

            ${this.descriptors.map((descriptor) => this.renderCard(descriptor))}
        `
    }

    private renderCard(descriptor: Descriptor) {
        try {
            return this.renderDescriptor(descriptor)
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error)
            return html`<section class="descriptor">
                <p class="text-danger mb-0">${message}</p>
            </section>`
        }
    }

    private renderDescriptor(descriptor: Descriptor) {
        // An upload is kept once it names a template, so exercises may not be a list.
        // Mapping a non-list throws, and Lit then draws no cards at all.
        const shown = descriptor as {
            metadata?: {
                name?: string
                version?: string
                publisher?: string
            }
            context?: { template?: Descriptor['context']['template'] }
            display?: { create?: unknown; exercises?: unknown }
        }
        const metadata = shown.metadata
        const template = shown.context?.template
        const exercises = shown.display?.exercises
        const choices = Array.isArray(exercises)
            ? exercises.flatMap((entry) => {
                  const label = choiceLabel(entry)
                  return label === '' ? [] : [label]
              })
            : []
        return html`
            <section class="descriptor">
                <div class="descriptor-heading">
                    <h2 class="h6 fw-semibold mb-0">
                        ${metadata?.name ?? 'Untitled descriptor'}
                    </h2>
                </div>
                <dl class="small">
                    <dt>Version</dt>
                    <dd>${metadata?.version ?? ''}</dd>
                    <dt>Publisher</dt>
                    <dd>${metadata?.publisher ?? ''}</dd>
                    <dt>Template</dt>
                    <dd class="identifier">
                        ${
                            template
                                ? `${template.moduleName}:${template.entityName}`
                                : ''
                        }
                    </dd>
                    <dt>Package</dt>
                    <dd class="identifier">${template?.packageId ?? ''}</dd>
                    <dt>Create</dt>
                    <dd>
                        ${shown.display?.create ? 'described' : 'not described'}
                    </dd>
                    <dt>Choices</dt>
                    <dd class="identifier">
                        ${choices.length ? choices.join(', ') : 'none'}
                    </dd>
                </dl>
                <details>
                    <summary class="small">JSON</summary>
                    <pre class="mb-0">
${JSON.stringify(descriptor, null, 2)}</pre>
                </details>
                <div>
                    <button
                        class="btn btn-outline-danger btn-sm rounded-pill"
                        type="button"
                        @click=${() => this.deleteUpload(descriptor)}
                    >
                        Delete
                    </button>
                </div>
            </section>
        `
    }
}
