// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'

import { AppHeader, WgWalletsSync } from '@/components/legacy'

function App() {
    return (
        <div style={{ width: '300px' }}>
            <AppHeader networkName="DevNet" networkConnected={true} />
            <Typography variant="h1">Parties</Typography>
            <WgWalletsSync
                client={null}
                onSyncSuccess={() => logger.info('Sync successful!')}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => alert('Button clicked!')}
            >
                <span>
                    <AddIcon />
                </span>
                <span>New</span>
            </Button>
        </div>
    )
}

export default App
