import { Chip, type ChipProps } from '@mui/material'
import { portfolioColors } from '@lib/theme'

type PrimaryBadgeProps = Omit<ChipProps, 'label' | 'size'>

export function PrimaryBadge({ sx, ...props }: PrimaryBadgeProps) {
    return (
        <Chip
            label="Primary"
            size="small"
            sx={[
                {
                    height: 22,
                    flexShrink: 0,
                    bgcolor: portfolioColors.green80,
                    color: portfolioColors.black,
                    fontWeight: 500,
                    '& .MuiChip-label': {
                        px: 1,
                    },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...props}
        />
    )
}
