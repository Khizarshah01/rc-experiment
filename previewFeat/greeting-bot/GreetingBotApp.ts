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

export class GreetingBotApp extends App implements IPostMessageSent {
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
        // Avoid loops: ignore messages from bots and apps
        if (message.sender.type === UserType.BOT || message.sender.type === UserType.APP) {
            return;
        }

        // Check if the message contains "hello"
        const text = (message.text || '').toLowerCase();
        if (!text.includes('hello')) {
            return;
        }

        // Send a greeting message
        const sender = await read.getUserReader().getAppUser();
        if (!sender) {
            return;
        }

        const builder = modify.getCreator().startMessage()
            .setRoom(message.room)
            .setSender(sender)
            .setText(`Hello @${message.sender.username}, how can I help you today?`);

        await modify.getCreator().finish(builder);
    }
}
