
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';
export const settings: Array<ISetting> = [

    {
        id: 'external_log_url',
        type: SettingType.STRING,
        packageValue: '',
        required: false,
        public: false,
        i18nLabel: 'External Logger',
        i18nDescription: 'URL to send userid and message on mention',
    },
];
