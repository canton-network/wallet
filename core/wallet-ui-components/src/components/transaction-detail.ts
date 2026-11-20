// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ClearSigningResult } from '@canton-network/core-tx-clear-signing'
import type { ParsedTransactionInfo } from '@canton-network/core-tx-visualizer'
import { html, css, nothing } from 'lit'

import './back-link.ts'
import './copy-button.ts'
import { customElement, property, state } from 'lit/decorators.js'

import { formatDateTime, formatUtcDateTime } from '../date-time.ts'
import { chevronDownIcon } from '../icons/index.ts'
import { renderCopyableValue } from '../internal/activity-render.ts'
import {
    getActivityStatusBadgeClass,
    getActivityStatusLabel,
    getActivityType,
} from '../internal/activity-utils.ts'
import { BaseElement } from '../internal/base-element.ts'

type OperationDescription = ClearSigningResult['operations'][number]
type DescribedField = OperationDescription['fields'][number]
type TemplateRef = NonNullable<OperationDescription['template']>

const OPERATION_STATUS_LABELS: Record<
    Exclude<OperationDescription['status'], 'described'>,
    string
> = {
    fallback: 'Partly described',
    undescribed: 'Not described',
    unverified: 'Unverified descriptor',
    invalid: 'Invalid descriptor',
    undescribable: 'Cannot describe',
}

const OPERATION_KIND_LABELS: Record<OperationDescription['kind'], string> = {
    create: 'Create',
    exercise: 'Exercise',
    other: 'Other',
}

const OPERATION_KIND_BADGE_CLASS: Record<OperationDescription['kind'], string> =
    {
        create: 'text-bg-secondary',
        exercise: 'text-bg-primary',
        other: 'text-bg-warning',
    }

/** Emitted when the user clicks the "Approve" button */
export class TransactionApproveEvent extends Event {
    constructor(public commandId: string) {
        super('transaction-approve', { bubbles: true, composed: true })
    }
}

/** Emitted when the user clicks the "Reject" button */
export class TransactionDeleteEvent extends Event {
    constructor(public commandId: string) {
        super('transaction-delete', { bubbles: true, composed: true })
    }
}

export
@customElement('wg-transaction-detail')
class WgTransactionDetail extends BaseElement {
    @property() accessor commandId = ''

    @property() accessor externalTxId: string | null = null

    @property() accessor status = ''

    @property() accessor txHash = ''

    @property() accessor tx = ''

    @property({ type: Object }) accessor parsed: ParsedTransactionInfo | null =
        null

    /** The clear-signing description of the transaction's root operations, when available */
    @property({ type: Object })
    accessor clearSigning: ClearSigningResult | null = null

    /** Why the transaction could not be described at all, when it could not */
    @property() accessor clearSigningError: string | null = null

    @property() accessor createdAt: string | null = null

    @property() accessor signedAt: string | null = null

    @property() accessor origin: string | null = null

    @property() accessor backHref = ''

    @property({ type: Boolean }) accessor isApproving = false

    @property({ type: Boolean }) accessor isDeleting = false

    @property({ type: Boolean }) accessor isSigning = false

    @property({ type: Boolean }) accessor submitFailed = false

    // Disables action buttons regardless of status
    @property({ type: Boolean }) accessor disabled = false

    @state() private accessor decodedExpanded = false

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: block;
                max-width: 900px;
                margin: 0 auto;
            }

            .page-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--wg-space-3);
                margin-bottom: var(--wg-space-4);
            }

            .page-title {
                color: var(--wg-text);
            }

            .detail-grid {
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-4);
            }

            .field {
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-1);
                min-width: 0;
            }

            .field--stacked {
                gap: var(--wg-space-2);
            }

            .field-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--wg-space-3);
                min-width: 0;
            }

            .detail-row {
                display: grid;
                grid-template-columns: minmax(0, 8.5rem) minmax(0, 1fr);
                align-items: center;
                gap: var(--wg-space-3);
                min-width: 0;
            }

            .label {
                margin: 0;
                color: var(--wg-text-secondary);
                font-size: var(--wg-font-size-xs);
                font-weight: var(--wg-font-weight-semibold);
                line-height: 1.4;
            }

            .value {
                margin: 0;
                color: var(--wg-text);
                font-size: var(--wg-font-size-sm);
                line-height: 1.5;
                min-width: 0;
                word-break: break-word;
                text-align: right;
            }

            .detail-value {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: var(--wg-space-2);
                min-width: 0;
            }

            .copyable-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--wg-space-2);
                min-width: 0;
            }

            .detail-value .value,
            .copyable-row wg-copy-button,
            .field-header wg-copy-button {
                flex: 0 0 auto;
            }

            .detail-value .value,
            .copyable-row .value {
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                word-break: normal;
            }

            .field--stacked .value,
            .decoded-box {
                text-align: left;
            }

            .signatory-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-2);
                min-width: 0;
            }

            .detail-row--top {
                align-items: start;
            }

            .detail-row--top > .label {
                padding-top: 0.45rem;
            }

            .detail-value--stacked {
                flex-direction: column;
                align-items: stretch;
                justify-content: flex-start;
            }

            .detail-value--stacked .copyable-row {
                width: 100%;
            }

            .toggle-btn {
                flex: 1;
                min-width: 0;
                padding: 0;
                border: none;
                background: transparent;
                color: inherit;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--wg-space-3);
                cursor: pointer;
                text-align: left;
            }

            .toggle-icon {
                display: inline-flex;
                align-items: center;
                color: var(--wg-text);
                transition: transform 0.2s ease;
            }

            .toggle-icon.open {
                transform: rotate(180deg);
            }

            .decoded-box {
                margin-top: var(--wg-space-2);
                margin-bottom: 0;
                padding: var(--wg-space-4);
                border: 1px solid var(--wg-border);
                border-radius: var(--wg-radius-lg);
                background: var(--wg-input-bg);
                color: var(--wg-text);
                font-family: var(--bs-font-monospace);
                white-space: pre-wrap;
                word-break: break-word;
                max-height: 20rem;
                overflow: auto;
            }

            .clear-signing {
                padding: var(--wg-space-4);
                border: 1px solid var(--wg-border);
                border-radius: var(--wg-radius-lg);
            }

            .operation {
                display: flex;
                flex-direction: column;
                gap: var(--wg-space-2);
            }

            .operation + .operation {
                padding-top: var(--wg-space-3);
                border-top: 1px solid var(--wg-border);
            }

            .operation-heading {
                display: flex;
                align-items: baseline;
                gap: var(--wg-space-2);
            }

            .operation-heading .badge {
                flex: none;
            }

            .intent {
                color: var(--wg-text);
                font-weight: var(--wg-font-weight-semibold);
                word-break: break-word;
            }

            .operation-origin {
                display: grid;
                grid-template-columns: minmax(0, 8.5rem) minmax(0, 1fr);
                gap: var(--wg-space-1) var(--wg-space-3);
                margin: 0;
            }

            .operation-origin dd {
                margin: 0;
                color: var(--wg-text);
                font-size: var(--wg-font-size-sm);
                word-break: break-word;
            }

            .operation-origin dd.identifier {
                font-family: var(--bs-font-monospace);
            }

            .operation-fields {
                display: grid;
                grid-template-columns: minmax(0, 8.5rem) minmax(0, 1fr);
                gap: var(--wg-space-1) var(--wg-space-3);
                margin: 0;
            }

            .operation-fields dd {
                margin: 0;
                color: var(--wg-text);
                font-size: var(--wg-font-size-sm);
                word-break: break-word;
            }

            .actions {
                margin-top: var(--wg-space-6);
                display: flex;
                gap: var(--wg-space-3);
                justify-content: flex-start;
                flex-wrap: nowrap;
            }

            .actions .btn {
                flex: 1 1 0;
                min-width: 0;
                white-space: nowrap;
            }

            .actions .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        `,
    ]

    private get isApproveDisabled() {
        return (
            this.disabled ||
            this.isApproving ||
            this.isDeleting ||
            this.isSigning
        )
    }

    private get isDeleteDisabled() {
        return this.disabled || this.isApproving || this.isDeleting
    }

    private toggleDecoded() {
        this.decodedExpanded = !this.decodedExpanded
    }

    private renderInlineField(label: string, value: unknown) {
        return html`
            <section class="field">
                <div class="detail-row">
                    <h2
                        class="label small fw-semibold text-body-secondary mb-0"
                    >
                        ${label}
                    </h2>
                    <div class="detail-value">
                        <p class="value mb-0 text-body">${value}</p>
                    </div>
                </div>
            </section>
        `
    }

    private renderSignatories() {
        const signatories = this.parsed?.signatories || []

        return html`
            <section class="field">
                <div class="detail-row detail-row--top">
                    <h2
                        class="label small fw-semibold text-body-secondary mb-0"
                    >
                        Signatories
                    </h2>
                    <div class="detail-value detail-value--stacked">
                        ${
                            signatories.length
                                ? html`
                                      <ul class="signatory-list">
                                          ${signatories.map(
                                              (signatory) => html`
                                                  <li class="copyable-row">
                                                      <p
                                                          class="value mb-0 text-body"
                                                      >
                                                          ${signatory}
                                                      </p>
                                                      <wg-copy-button
                                                          .value=${signatory}
                                                          label="Copy signatory"
                                                      ></wg-copy-button>
                                                  </li>
                                              `
                                          )}
                                      </ul>
                                  `
                                : html`<p class="value mb-0 text-body">N/A</p>`
                        }
                    </div>
                </div>
            </section>
        `
    }

    private renderClearSigning() {
        const result = this.clearSigning
        if (this.clearSigningError) {
            return html`
                <section class="field field--stacked clear-signing">
                    <h2
                        class="label small fw-semibold text-body-secondary mb-0"
                    >
                        What you are signing
                    </h2>
                    <div class="alert alert-danger small mb-0" role="alert">
                        This transaction could not be described:
                        ${this.clearSigningError}. Review the transaction JSON
                        before approving.
                    </div>
                </section>
            `
        }
        if (!result) {
            return nothing
        }

        return html`
            <section class="field field--stacked clear-signing">
                <h2 class="label small fw-semibold text-body-secondary mb-0">
                    What you are signing
                </h2>
                ${
                    result.complete
                        ? nothing
                        : html`<div
                              class="alert alert-warning small mb-0"
                              role="alert"
                          >
                              Parts of this transaction are not described.
                              Review the transaction JSON before approving.
                          </div>`
                }
                ${result.operations.map((op) => this.renderOperation(op))}
            </section>
        `
    }

    private renderOperation(op: OperationDescription) {
        return html`
            <div class="operation">
                <div class="operation-heading">
                    <span
                        class="badge rounded-pill ${OPERATION_KIND_BADGE_CLASS[op.kind]}"
                        >${OPERATION_KIND_LABELS[op.kind]}</span
                    >
                    <p class="intent mb-0">
                        ${op.intent}
                        ${
                            op.status === 'described'
                                ? nothing
                                : html`<span
                                      class="badge rounded-pill text-bg-warning ms-1"
                                      >${OPERATION_STATUS_LABELS[op.status]}</span
                                  >`
                        }
                    </p>
                </div>
                ${renderOperationOrigin(op)}
                ${op.fields.length ? renderFields(op.fields) : nothing}
            </div>
        `
    }

    private renderDecodedBox(decoded: string) {
        return html`<pre class="decoded-box small mb-0">${decoded}</pre>`
    }

    protected render() {
        const activityType = getActivityType(this.parsed)
        const decoded = this.parsed?.jsonString || 'N/A'

        return html`
            <div class="page-header">
                <h1 class="page-title h4 fw-semibold mb-0">Activity Details</h1>
                ${
                    this.backHref
                        ? html`<wg-back-link
                              href=${this.backHref}
                          ></wg-back-link>`
                        : nothing
                }
            </div>

            <div class="detail-grid">
                ${this.renderClearSigning()}
                ${this.renderInlineField(
                    'Status',
                    html`<span
                        class="badge rounded-pill small ${getActivityStatusBadgeClass(
                            this.status
                        )}"
                    >
                        ${getActivityStatusLabel(this.status)}
                    </span>`
                )}
                ${this.renderInlineField('Action type', activityType)}
                ${renderCopyableValue(
                    'Created at',
                    this.createdAt,
                    'Copy created at timestamp',
                    {
                        display: formatDateTime(this.createdAt),
                        title: formatUtcDateTime(this.createdAt),
                    }
                )}
                ${this.renderSignatories()}
                ${renderCopyableValue(
                    'Template',
                    this.parsed?.templateId || null,
                    'Copy template'
                )}
                ${renderCopyableValue(
                    'Command ID',
                    this.commandId,
                    'Copy command ID'
                )}
                ${
                    this.externalTxId
                        ? renderCopyableValue(
                              'External transaction ID',
                              this.externalTxId,
                              'Copy external transaction ID'
                          )
                        : nothing
                }
                ${renderCopyableValue(
                    'Transaction hash',
                    this.txHash,
                    'Copy transaction hash'
                )}

                <section class="field field--stacked">
                    <div class="field-header">
                        <button
                            type="button"
                            class="toggle-btn"
                            @click=${this.toggleDecoded}
                            aria-expanded=${this.decodedExpanded}
                        >
                            <h2
                                class="label small fw-semibold text-body-secondary mb-0"
                            >
                                Transaction JSON Object
                            </h2>
                            <span
                                class="toggle-icon ${
                                    this.decodedExpanded ? 'open' : ''
                                }"
                            >
                                ${chevronDownIcon}
                            </span>
                        </button>
                        ${
                            this.parsed?.jsonString
                                ? html`
                                      <wg-copy-button
                                          .value=${this.parsed.jsonString}
                                          label="Copy transaction json object"
                                      ></wg-copy-button>
                                  `
                                : nothing
                        }
                    </div>
                    ${
                        this.decodedExpanded
                            ? this.renderDecodedBox(decoded)
                            : nothing
                    }
                </section>
            </div>

            ${this.renderActionButtons()}
        `
    }

    private renderActionButtons() {
        if (this.status !== 'pending' && this.status !== 'signed') {
            return nothing
        }

        return html`
            <div class="actions">
                ${
                    this.status === 'pending'
                        ? html`
                              <button
                                  class="btn btn-outline-danger rounded-pill d-inline-flex align-items-center justify-content-center gap-2"
                                  ?disabled=${this.isDeleteDisabled}
                                  @click=${() =>
                                      this.dispatchEvent(
                                          new TransactionDeleteEvent(
                                              this.commandId
                                          )
                                      )}
                              >
                                  ${
                                      this.isDeleting
                                          ? html`<div
                                                class="spinner-border spinner-border-sm"
                                            ></div>`
                                          : nothing
                                  }
                                  Reject
                              </button>
                          `
                        : nothing
                }

                <button
                    class="btn btn-primary rounded-pill d-inline-flex align-items-center justify-content-center gap-2"
                    ?disabled=${this.isApproveDisabled}
                    @click=${() =>
                        this.dispatchEvent(
                            new TransactionApproveEvent(this.commandId)
                        )}
                >
                    ${
                        this.isApproving || this.isSigning
                            ? html`<div
                                  class="spinner-border spinner-border-sm"
                              ></div>`
                            : nothing
                    }
                    ${
                        this.status === 'signed' && this.submitFailed
                            ? 'Retry submit'
                            : 'Approve'
                    }
                </button>
            </div>
        `
    }
}

function typeName({ moduleName, entityName }: TemplateRef): string {
    return `${moduleName}:${entityName}`
}

// What the transaction itself says it does (kind, choice, template), so an operation is identified
// even when its descriptor words it vaguely or is missing. The descriptor's own claim is kept apart.
function renderOperationOrigin(op: OperationDescription) {
    const { choiceId, descriptor, template } = op
    return html`<dl class="operation-origin">
        ${
            op.kind === 'exercise' && choiceId !== undefined
                ? html`<dt class="label">Choice</dt>
                      <dd class="identifier">
                          ${choiceId}${
                              op.interface
                                  ? html` <span class="text-body-secondary"
                                            >via</span
                                        >
                                        ${typeName(op.interface)}`
                                  : nothing
                          }
                      </dd>`
                : nothing
        }
        ${
            op.reason
                ? html`<dt class="label">Why</dt>
                      <dd class="text-warning-emphasis">${op.reason}</dd>`
                : nothing
        }
        ${
            template
                ? html`<dt class="label">
                          ${op.kind === 'exercise' ? 'On' : 'Template'}
                      </dt>
                      <dd class="identifier">${typeName(template)}</dd>
                      <dt class="label">Package</dt>
                      <dd class="identifier">${template.packageId}</dd>`
                : nothing
        }
        ${
            descriptor
                ? html`<dt class="label">Described by</dt>
                      <dd>
                          ${descriptor.name} v${descriptor.version} by
                          ${descriptor.publisher}
                      </dd>`
                : nothing
        }
    </dl>`
}

function renderFields(fields: DescribedField[]): unknown {
    return html`<dl class="operation-fields">
        ${fields.map(
            (field) => html`
                <dt class="label">${field.label}</dt>
                <dd>${renderFieldValue(field)}</dd>
            `
        )}
    </dl>`
}

function renderFieldValue(field: DescribedField) {
    if ('error' in field) {
        return html`<span class="text-danger"
            >Cannot display: ${field.error}</span
        >`
    }
    return field.value
}
