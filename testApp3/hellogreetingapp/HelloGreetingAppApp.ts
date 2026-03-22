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

export class HelloGreetingAppApp extends App implements IPostMessageSent {
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
        // Bot loop guard
        if (message.sender.type === UserType.BOT) {
            return;
        }

        // App's own bot user guard
        const appUser = await read.getUserReader().getAppUser(this.getID());
        if (message.sender.id === appUser?.id) {
            return;
        }

        // Keyword filter
        if (!message.text || !message.text.toLowerCase().includes('hello')) {
            return;
        }

        const sender = message.sender;
        const room = message.room;

        const messageBuilder = modify.getCreator().startMessage()
            .setRoom(room)
            .setText(`Hello ${sender.username || sender.name}! How can I help you today?`);

        await modify.getCreator().finish(messageBuilder);
    }
}
