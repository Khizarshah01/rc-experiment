import {
    IConfigurationExtend,
    IEnvironmentRead,
    IAppAccessors,
    ILogger, IRead, IHttp, IModify, IPersistence
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { Mention } from './slashCommands/mention';
import { IPostMessageSent, IMessage } from '@rocket.chat/apps-engine/definition/messages';
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import { settings } from './settings';

export class GithubMentionApp extends App implements IPostMessageSent {
    private readonly appLogger: ILogger

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors)
        this.appLogger = this.getLogger()
        this.appLogger.debug('Hello, World!')
    }

    protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        await configuration.slashCommands.provideSlashCommand(new Mention());
        await Promise.all(
            settings.map((setting) =>
                configuration.settings.provideSetting(setting)
            )
        );
    }

    public async checkPostMessageSent(message: IMessage, read: IRead, http: IHttp): Promise<boolean> {
        if (!message.text) {
            return false;
        }
        return message.text.includes('@khizarshah01');
    }

    public async executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
        const association = new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            'githubmention'
        );

        const records = await read.getPersistenceReader().readByAssociation(association);

        if (!records.length || !(records[0] as any).enabled) {
            return;
        }

        const externalLoggerUrl = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById('external_log_url');

        const notifier = read.getNotifier();
        const builder = notifier.getMessageBuilder();

        if (!externalLoggerUrl || externalLoggerUrl.trim() === '') {
            builder
                .setRoom(message.room)
                .setText(
                    `Thank you for mentioning me, @${message.sender.username}`
                );
            await notifier.notifyUser(message.sender, builder.getMessage());
            return;
        } else {
            try {
                const response = await http.post(externalLoggerUrl, {
                    headers: { 'Content-Type': 'application/json' },
                    data: {
                        userid: message.sender.id,
                        message: message.text,
                    },
                });
                const result = response.data?.result;
                const id = response.data?.id;
                builder
                    .setRoom(message.room)
                    .setText(
                        `${result} [${id}]`
                    );
                await notifier.notifyUser(message.sender, builder.getMessage());
            } catch (error) {
                builder
                    .setRoom(message.room)
                    .setText(`error: ${error}`);
                await notifier.notifyUser(message.sender, builder.getMessage());
            }
        }
    }
}
