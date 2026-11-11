// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'

export type ServerNoticeSeverity = 'info' | 'warning'

export interface ServerNoticeReport {
    // Stable identifier, reporting the same id again updates the existing notice
    id: string
    severity: ServerNoticeSeverity
    message: string
}

export interface ServerNotice extends ServerNoticeReport {
    firstSeenAt: string
    lastSeenAt: string
}

/**
 * In-memory registry of notices for server administrators, e.g. deprecated
 * config fields or deprecated API usage. Notices are not persisted, so a
 * notice disappears after the cause is fixed and the gateway is restarted.
 */
export class ServerNotices {
    private readonly notices = new Map<string, ServerNotice>()

    constructor(private readonly logger: Logger) {}

    report(report: ServerNoticeReport): void {
        const now = new Date().toISOString()
        const existing = this.notices.get(report.id)
        if (existing) {
            this.notices.set(report.id, {
                ...report,
                firstSeenAt: existing.firstSeenAt,
                lastSeenAt: now,
            })
            return
        }

        this.notices.set(report.id, {
            ...report,
            firstSeenAt: now,
            lastSeenAt: now,
        })
        const logFields = { noticeId: report.id }
        if (report.severity === 'warning') {
            this.logger.warn(logFields, report.message)
        } else {
            this.logger.info(logFields, report.message)
        }
    }

    list(): ServerNotice[] {
        return [...this.notices.values()]
    }
}
