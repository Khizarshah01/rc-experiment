import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IEnvironmentRead,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { StartupType } from '@rocket.chat/apps-engine/definition/scheduler';

export class JobApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        await configuration.scheduler.registerProcessors([
            {
                id: 'my-test-job',
                processor: this.myTestJobProcessor,
                startupSetting: {
                    type: StartupType.RECURRING,
                    interval: '*/2 * * * *',
                },
            },
        ]);
    }

    private async myTestJobProcessor(): Promise<void> {
        this.getLogger().log('Test app job executed!');
    }
}
