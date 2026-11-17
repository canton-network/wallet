import { getPinoSink } from '@logtape/adaptor-pino'
import { configure } from '@logtape/logtape'
import { pino, type Logger } from 'pino'

export const configureLogging = async (): Promise<Logger> => {
    const logger = pino({
        level: 'trace',
    })

    await configure({
        sinks: { pino: getPinoSink(logger) },
        loggers: [
            { category: ['core'], sinks: ['pino'], lowestLevel: 'trace' },
        ],
    })

    return logger
}
