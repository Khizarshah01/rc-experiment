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
        // 1. Bot infinite loop guard
        if (message.sender.type === UserType.BOT || message.sender.type === UserType.APP) {
            return;
        }

        // 2. App's own bot user guard
        const appUser = await read.getUserReader().getAppUser(this.getID());
        if (appUser && message.sender.id === appUser.id) {
            return;
        }

        const text = message.text?.toLowerCase();

        // 3. Check for "hello"
        if (text && text.includes('hello')) {
            const builder = modify.getCreator().startMessage()
                .setRoom(message.room)
                .setText(`Hello @${message.sender.username}! I am the Greeting App. How can I help you today?`);

            await modify.getCreator().finish(builder);
        }
    }
}
