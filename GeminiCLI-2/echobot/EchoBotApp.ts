import {
    IAppAccessors,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { UserType } from '@rocket.chat/apps-engine/definition/users';

export class EchoBotApp extends App implements IPostMessageSent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async executePostMessageSent(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<void> {
        // Only echo messages sent by regular users or other apps to avoid infinite loops
        if (message.sender.type === UserType.BOT || message.sender.type === UserType.APP) {
            return;
        }

        const text = message.text;
        if (!text || !text.toLowerCase().startsWith('echo ')) {
            return;
        }

        // Extract the content after 'echo '
        const echoText = text.slice(5).trim();
        if (!echoText) {
            return;
        }

        const appUser = await read.getUserReader().getAppUser();
        if (!appUser) {
            this.getLogger().error('App user not found');
            return;
        }

        const messageBuilder = modify.getCreator().startMessage()
            .setRoom(message.room)
            .setSender(appUser)
            .setText(echoText);

        await modify.getCreator().finish(messageBuilder);
    }
}
