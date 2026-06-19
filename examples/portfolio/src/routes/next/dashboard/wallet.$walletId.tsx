import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { PrimaryBadge } from '@components/dashboard/primary-badge'
import { TransactionHistory } from '@components/dashboard/transaction-history'
import { WalletAssetsContent } from '@components/dashboard/wallet-assets-content'
import { TransferDialog } from '@components/next/transfer-dialog'
import { PillButton } from '@components/ui/PillButton'
import { CopyableIdentifier } from '@components/copyable-identifier'
import { useAccounts } from '@hooks/useAccounts'
import { useWalletHoldings } from '@hooks/useWalletHoldings'

export const Route = createFileRoute('/next/dashboard/wallet/$walletId')({
    component: RouteComponent,
})

function RouteComponent() {
    const { walletId } = Route.useParams()
    const accounts = useAccounts()
    const wallet = accounts.find((account) => account.partyId === walletId)
    const walletName = wallet?.hint ?? 'Unknown wallet'
    const walletHoldings = useWalletHoldings(walletId)
    const [transferOpen, setTransferOpen] = useState(false)

    return (
        <Box sx={{ px: 5.5, py: 7.5 }}>
            <Box
                sx={{
                    mb: 5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 3,
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {walletName}
                        </Typography>
                        {wallet?.primary && <PrimaryBadge />}
                    </Box>

                    <Box sx={{ color: 'text.secondary' }}>
                        <CopyableIdentifier value={walletId} maxLength={30} />
                    </Box>
                </Box>

                <PillButton
                    type="button"
                    disabled={!wallet?.primary}
                    onClick={() => setTransferOpen(true)}
                >
                    Transfer
                </PillButton>
            </Box>

            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                Assets
            </Typography>

            <WalletAssetsContent {...walletHoldings} />

            <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                Transaction History
            </Typography>

            <TransactionHistory walletId={walletId} />

            <TransferDialog
                open={transferOpen}
                onClose={() => setTransferOpen(false)}
            />
        </Box>
    )
}
