import { SDKPlugin, type PreparedCommand, type SDKContext } from '@canton-network/wallet-sdk';
import * as CodegenUtility from './codegen/utility-registry-app-v0-0.7.0/lib';

export const WalletSDKUtilitiesPluginName = 'utilities';

export class WalletSDKUtilitiesPlugin extends SDKPlugin {
  constructor(ctx: SDKContext) {
    super(WalletSDKUtilitiesPluginName, ctx);
  }

  public preapprovalTransfer = {
    create: (
      args: CodegenUtility.Utility.Registry.App.V0.Model.TransferPreapproval.TransferPreapproval,
    ): PreparedCommand<'CreateCommand'> => {
      const transferPreapprovalCommand: PreparedCommand<'CreateCommand'>[0] = {
        CreateCommand: {
          templateId: CodegenUtility.Utility.Registry.App.V0.Model.TransferPreapproval.TransferPreapproval.templateId,
          createArguments: args,
        },
      };

      this.logger.info(
        {
          timestamp: new Date().toISOString(),
          command: transferPreapprovalCommand,
        },
        'Successfully created transfer preapproval command. Executing...',
      );

      return [transferPreapprovalCommand, []];
    },
  };
}
