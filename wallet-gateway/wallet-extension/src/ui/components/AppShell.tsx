// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import LockOutlined from '@mui/icons-material/LockOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import Alert from '@mui/material/Alert'
import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem, { type MenuItemProps } from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { createLink, useMatches, useRouter } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'

import { useLockVault } from '@/ui/features/vault/index.ts'

function AnchorMenuItem(props: MenuItemProps<'a'>) {
    return <MenuItem component="a" {...props} />
}

const MenuItemLink = createLink(AnchorMenuItem)

const NAV_ITEMS = [
    { to: '/parties', label: 'Parties' },
    { to: '/assets', label: 'Assets' },
    { to: '/assets/send', label: 'Send' },
    { to: '/transfers/incoming', label: 'Incoming transfers' },
    { to: '/transfers', label: 'Outgoing transfers' },
] as const

/**
 * The pages besides Lock need a session, and leaving an approval page would
 * leave the dApp waiting, so those pages offer only Lock.
 */
function useShowsNavigation(): boolean {
    return useMatches({
        select: (matches) =>
            matches.some(
                (match) => match.routeId === '/_unlocked/_connected'
            ) &&
            !matches.some(
                (match) =>
                    match.routeId ===
                    '/_unlocked/_connected/approve-transaction'
            ),
    })
}

export function AppShell({ children }: { children: ReactNode }) {
    const router = useRouter()
    const lock = useLockVault()
    const showsNavigation = useShowsNavigation()
    const [anchor, setAnchor] = useState<HTMLElement | null>(null)
    const close = () => setAnchor(null)

    return (
        <>
            <AppBar position="sticky" color="default" elevation={0}>
                <Toolbar variant="dense" sx={{ gap: 1 }}>
                    <Typography
                        variant="h6"
                        component="span"
                        sx={{ flexGrow: 1, fontWeight: 600 }}
                    >
                        Wallet
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="Menu"
                        aria-controls={anchor ? 'app-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={anchor ? 'true' : undefined}
                        onClick={(event) => setAnchor(event.currentTarget)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        id="app-menu"
                        anchorEl={anchor}
                        open={anchor !== null}
                        onClose={close}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        {showsNavigation && [
                            ...NAV_ITEMS.map(({ to, label }) => (
                                <MenuItemLink
                                    key={to}
                                    to={to}
                                    activeOptions={{ exact: true }}
                                    activeProps={{ selected: true }}
                                    onClick={close}
                                >
                                    {label}
                                </MenuItemLink>
                            )),
                            <Divider key="divider" />,
                        ]}
                        <MenuItem
                            disabled={lock.isPending}
                            // The guards then send this page to /unlock.
                            onClick={() => {
                                close()
                                lock.mutate(undefined, {
                                    onSuccess: () => void router.invalidate(),
                                })
                            }}
                        >
                            <ListItemIcon>
                                <LockOutlined fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Lock</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Container component="main" maxWidth="md" sx={{ py: 2 }}>
                {lock.isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Couldn't lock the wallet. Try again.
                    </Alert>
                )}
                {children}
            </Container>
        </>
    )
}
