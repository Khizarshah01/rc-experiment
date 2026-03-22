import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import {
    IMessage,
    IPostMessageSent,
} from '@rocket.chat/apps-engine/definition/messages';
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom, RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { OooCommand } from './OooCommand';

export class WorkshopApp extends App implements IPostMessageSent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        await configuration.slashCommands.provideSlashCommand(new OooCommand());
    }

    public async executePostMessageSent(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<void> {
        const sender = message.sender;
        const room = message.room;

        if (!message.text) {
            return;
        }

        this.getLogger().debug(`Processing message for OoO from user ${sender.username}`);

        const notifiedUsers = new Set<string>();

        // Check for mentions
        const mentionRegex = /@([a-zA-Z0-9.\-_]+)/g;
        let match;
        while ((match = mentionRegex.exec(message.text)) !== null) {
            const username = match[1];
            if (username === 'all' || username === 'here') {
                continue;
            }

            const user = await read.getUserReader().getByUsername(username);
            if (user && user.id !== sender.id) {
                await this.checkAndNotify(user.id, user.username, sender, room, read, modify, notifiedUsers);
            }
        }

        // Check for DM
        if (room.type === RoomType.DIRECT_MESSAGE) {
            const members = await read.getRoomReader().getMembers(room.id);
            for (const member of members) {
                if (member.id !== sender.id) {
                    await this.checkAndNotify(member.id, member.username, sender, room, read, modify, notifiedUsers);
                }
            }
        }
    }

    private async checkAndNotify(
        targetUserId: string,
        targetUsername: string,
        sender: IUser,
        room: IRoom,
        read: IRead,
        modify: IModify,
        notifiedUsers: Set<string>,
    ): Promise<void> {
        if (notifiedUsers.has(targetUserId)) {
            return;
        }

        const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, targetUserId);
        const [data] = await read.getPersistenceReader().readByAssociation(association) as Array<{ isOoO: boolean }>;

        if (data && data.isOoO) {
            notifiedUsers.add(targetUserId);
            const appUser = await read.getUserReader().getAppUser();
            
            const messageBuilder = modify.getCreator().startMessage()
                .setSender(appUser || sender)
                .setRoom(room)
                .setText(`User @${targetUsername} is currently Out of Office.`);

            await modify.getNotifier().notifyUser(sender, messageBuilder.getMessage());
        }
    }
}
