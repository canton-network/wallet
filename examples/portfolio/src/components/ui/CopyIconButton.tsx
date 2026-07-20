import { useState, type MouseEvent } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { IconButton, Tooltip, type IconButtonProps } from '@mui/material'
import { normalizeSx } from './utils'

type CopyIconButtonProps = Omit<IconButtonProps, 'onClick'> & {
    value: string
    label?: string
    copiedLabel?: string
}

export function CopyIconButton({
    value,
    label = 'Copy to clipboard',
    copiedLabel = 'Copied!',
    size = 'small',
    sx,
    ...props
}: CopyIconButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <Tooltip title={copied ? copiedLabel : label}>
            <IconButton
                aria-label={copied ? copiedLabel : label}
                size={size}
                onClick={handleCopy}
                sx={[
                    { color: copied ? 'success.main' : 'secondary.main' },
                    ...normalizeSx(sx),
                ]}
                {...props}
            >
                {copied ? (
                    <CheckIcon fontSize="small" />
                ) : (
                    <ContentCopyIcon fontSize="small" />
                )}
            </IconButton>
        </Tooltip>
    )
}
