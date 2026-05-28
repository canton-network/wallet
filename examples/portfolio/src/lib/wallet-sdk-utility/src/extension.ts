import {
    SDKPlugin,
    type PreparedCommand,
    type SDKContext,
} from '@canton-network/wallet-sdk'
import type { TransferPreapproval } from './codegen/utility-registry-app-v0-0.7.0/lib/Utility/Registry/App/V0/Model/TransferPreapproval/module'

export const WalletSDKUtilitiesPluginName = 'utilities'
const TRANSFER_PREAPPROVAL_TEMPLATE_ID =
    '#utility-registry-app-v0:Utility.Registry.App.V0.Model.TransferPreapproval:TransferPreapproval'

export class WalletSDKUtilitiesPlugin extends SDKPlugin {
    constructor(ctx: SDKContext) {
        super(WalletSDKUtilitiesPluginName, ctx)
    }

    public preapprovalTransfer = {
        create: (
            args: TransferPreapproval
        ): PreparedCommand<'CreateCommand'> => {
            const transferPreapprovalCommand: PreparedCommand<'CreateCommand'>[0] =
                {
                    CreateCommand: {
                        templateId: TRANSFER_PREAPPROVAL_TEMPLATE_ID,
                        createArguments: args,
                    },
                }

            this.logger.info(
                {
                    timestamp: new Date().toISOString(),
                    command: transferPreapprovalCommand,
                },
                'Successfully created transfer preapproval command. Executing...'
            )

            return [transferPreapprovalCommand, []]
        },
    }
}
