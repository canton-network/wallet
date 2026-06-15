import { useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { ActionRequiredDialog } from '@components/dashboard/action-required-dialog'
import { OffersContent } from '@components/offers/offers-content'
import { OfferTabs } from '@components/offers/offer-tabs'
import { useOffers, type OfferDirection } from '@hooks/useOffers'

export const Route = createFileRoute('/next/dashboard/offers')({
    component: RouteComponent,
})

function RouteComponent() {
    const offers = useOffers()
    const [selectedDirection, setSelectedDirection] =
        useState<OfferDirection>('incoming')
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
    const selectedOffers =
        selectedDirection === 'incoming' ? offers.incoming : offers.outgoing
    const visibleOffers = useMemo(() => selectedOffers, [selectedOffers])
    const selectedOffer = useMemo(
        () =>
            selectedOfferId
                ? (offers.all.find((offer) => offer.id === selectedOfferId) ??
                  null)
                : null,
        [offers.all, selectedOfferId]
    )

    return (
        <Box sx={{ px: 4, py: 8 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" component="h1" sx={{ mb: 1.5 }}>
                    Offers
                </Typography>
                <Typography variant="body1" color="text.primary">
                    These are offers sent to and from your primary wallet
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: { xs: 'stretch', md: 'end' },
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 2,
                    borderBottom: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                    flexDirection: { xs: 'column', md: 'row' },
                }}
            >
                <OfferTabs
                    value={selectedDirection}
                    onChange={setSelectedDirection}
                />
            </Box>

            <Box component="section" aria-label={`${selectedDirection} offers`}>
                <OffersContent
                    offers={visibleOffers}
                    direction={selectedDirection}
                    isLoading={offers.isLoading}
                    isError={offers.isError}
                    error={offers.error}
                    hasSearchQuery={false}
                    onOfferClick={(offer) => setSelectedOfferId(offer.id)}
                />
            </Box>

            <ActionRequiredDialog
                item={selectedOffer?.source ?? null}
                onClose={() => setSelectedOfferId(null)}
            />
        </Box>
    )
}
