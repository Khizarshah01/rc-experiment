import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';

export class OooCommand implements ISlashCommand {
    public command = 'ooo-vwyx';
    public i18nParamsExample = 'on_off';
    public i18nDescription = 'Set or disable your Out of Office status';
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<void> {
        const user = context.getSender();
        const params = context.getArguments();

        if (params.length === 0) {
            return this.showStatus(context, read, modify);
        }

        const action = params[0].toLowerCase();

        if (action === 'on') {
            await this.setStatus(user.id, true, persis);
            await this.sendEphemeral(context, modify, 'Your Out of Office status is now **enabled**.');
        } else if (action === 'off') {
            await this.setStatus(user.id, false, persis);
            await this.sendEphemeral(context, modify, 'Your Out of Office status is now **disabled**.');
        } else {
            await this.sendEphemeral(context, modify, 'Invalid argument. Use `on` or `off`.');
        }
    }

    private async setStatus(userId: string, isOoO: boolean, persis: IPersistence): Promise<void> {
        const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, userId);
        await persis.updateByAssociation(association, { isOoO }, true);
    }

    private async showStatus(context: SlashCommandContext, read: IRead, modify: IModify): Promise<void> {
        const sender = context.getSender();
        const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, sender.id);
        const [data] = await read.getPersistenceReader().readByAssociation(association) as Array<{ isOoO: boolean }>;

        const status = data && data.isOoO ? 'enabled' : 'disabled';
        await this.sendEphemeral(context, modify, `Your Out of Office status is currently **${status}**.`);
    }

    private async sendEphemeral(context: SlashCommandContext, modify: IModify, message: string): Promise<void> {
        const sender = context.getSender();
        const room = context.getRoom();

        const messageBuilder = modify.getCreator().startMessage()
            .setSender(sender)
            .setRoom(room)
            .setText(message);

        await modify.getNotifier().notifyUser(sender, messageBuilder.getMessage());
    }
}
