import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';

export class HiCommand implements ISlashCommand {
    public command = 'hi';
    public i18nParamsExample = '';
    public i18nDescription = 'Greets the user with their username';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const room = context.getRoom();
        const appUser = await read.getUserReader().getAppUser();

        const messageBuilder = modify.getCreator().startMessage();

        messageBuilder
            .setSender(appUser || user)
            .setRoom(room)
            .setText(`Hello, ${user.username}!`);

        await modify.getCreator().finish(messageBuilder);
    }
}
