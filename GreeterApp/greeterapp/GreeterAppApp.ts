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

export class GreeterAppApp extends App implements IPostMessageSent {
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
        const text = message.text ? message.text.toLowerCase() : '';

        if (!text.includes('hello')) {
            return;
        }

        // We don't want to reply to our own messages or messages from other bots
        if (message.sender.roles && message.sender.roles.includes('bot')) {
            return;
        }

        const greeter = modify.getCreator().startMessage();
        greeter.setRoom(message.room);
        greeter.setText(`Hello @${message.sender.username}! I am here to greet you!`);

        await modify.getCreator().finish(greeter);
    }
}
