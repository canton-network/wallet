import { stopRegistry as stopV1Registry } from '@canton-network/example-test-token-v1-registry'
import { stopRegistry as stopV2Registry } from '@canton-network/example-test-token-v2-registry'

function assertCondition(
    condition: boolean,
    failureMessage: string,
    failureConditionCallback: (() => void) | undefined,
    stackStart: typeof assert
): asserts condition {
    if (!condition) {
        failureConditionCallback?.()
        const error = new Error(failureMessage)
        // We use this to point directly to line where error is thrown
        Error.captureStackTrace(error, stackStart)
        throw error
    }
}

export function assert(
    condition: boolean,
    failureMessage: string,
    failureConditionCallback?: () => void
): asserts condition {
    assertCondition(condition, failureMessage, failureConditionCallback, assert)
}

export function assertV1(
    condition: boolean,
    failureMessage: string
): asserts condition {
    assertCondition(condition, failureMessage, stopV1Registry, assertV1)
}

export function assertV2(
    condition: boolean,
    failureMessage: string
): asserts condition {
    assertCondition(condition, failureMessage, stopV2Registry, assertV2)
}
