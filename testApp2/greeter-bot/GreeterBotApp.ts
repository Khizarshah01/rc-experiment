import {
    IAppAccessors,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { UserType } from '@rocket.chat/apps-engine/definition/users';

export class GreeterBotApp extends App implements IPostMessageSent {
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
        // Bot loop guard - do not reply to other bots
        if (message.sender.type === UserType.BOT || message.sender.type === UserType.APP) {
            return;
        }

        // App's own bot user guard - do not reply to itself
        const appUser = await read.getUserReader().getAppUser(this.getID());
        if (message.sender.id === appUser?.id) {
            return;
        }

        // Keyword filter - only respond when the message contains 'hello'
        const messageText = message.text?.toLowerCase();
        if (!messageText || !messageText.includes('hello')) {
            return;
        }

        // Prepare the greeting message
        const greeting = `Hello @${message.sender.username}, how can I help you today?`;

        const messageBuilder = modify.getCreator().startMessage()
            .setRoom(message.room)
            .setText(greeting);

        // Send the message
        await modify.getCreator().finish(messageBuilder);
    }
}
