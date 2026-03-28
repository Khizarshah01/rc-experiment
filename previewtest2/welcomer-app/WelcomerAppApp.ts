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
import { IPostRoomUserJoined, IRoomUserJoinedContext } from '@rocket.chat/apps-engine/definition/rooms';

export class WelcomerAppApp extends App implements IPostRoomUserJoined {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async executePostRoomUserJoined(
        context: IRoomUserJoinedContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<void> {
        const { joiningUser, room } = context;

        // Don't welcome the bot itself
        const botUser = await read.getUserReader().getAppUser();
        if (botUser && joiningUser.id === botUser.id) {
            return;
        }

        const welcomeMessage = `welcome to the club, @${joiningUser.username}`;

        if (!botUser) {
            this.getLogger().error('App user not found');
            return;
        }

        const builder = modify.getCreator().startMessage()
            .setRoom(room)
            .setSender(botUser)
            .setText(welcomeMessage);

        await modify.getCreator().finish(builder);
    }
}
