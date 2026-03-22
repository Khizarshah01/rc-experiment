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

export class TestApp extends App implements IPostMessageSent {
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
        if (!message.text || !message.text.toLowerCase().includes('hello')) {
            return;
        }

        const sender = await read.getUserReader().getAppUser();
        if (!sender) {
            return;
        }

        // Prevent infinite loop if the bot sends a message containing "hello"
        if (message.sender.id === sender.id) {
            return;
        }

        const builder = modify.getCreator().startMessage()
            .setSender(sender)
            .setRoom(message.room)
            .setText(`Hello @${message.sender.username}, how can I help you today?`);

        await modify.getCreator().finish(builder);
    }
}
