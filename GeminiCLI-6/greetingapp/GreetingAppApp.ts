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

export class GreetingAppApp extends App implements IPostMessageSent {
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
        // Bot loop guard: Ignore messages from bots and other apps
        if (message.sender.type === UserType.BOT || message.sender.type === UserType.APP) {
            return;
        }

        // Ignore messages from the app's own bot user
        const appUser = await read.getUserReader().getAppUser(this.getID());
        if (appUser && message.sender.id === appUser.id) {
            return;
        }

        // Keyword filter: Only respond if message text includes 'hello'
        const text = message.text?.toLowerCase();
        if (!text || !text.includes('hello')) {
            return;
        }

        const sender = message.sender.username || message.sender.name;
        const greeting = `Hello ${sender}! I'm here to greet you!`;

        const messageBuilder = modify.getCreator().startMessage()
            .setRoom(message.room)
            .setText(greeting);

        await modify.getCreator().finish(messageBuilder);
    }
}
