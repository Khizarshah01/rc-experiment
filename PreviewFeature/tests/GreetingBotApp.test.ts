import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { UserType } from '@rocket.chat/apps-engine/definition/users';
import { GreetingBotApp } from '../GreetingBotApp';

describe('GreetingBotApp', () => {
    let app: GreetingBotApp;
    let mockRead: any;
    let mockHttp: any;
    let mockPersistence: any;
    let mockModify: any;
    let mockMessageBuilder: any;

    beforeEach(() => {
        app = new GreetingBotApp(
            {
                name: 'Greeting Bot',
                author: { name: 'Gemini CLI' },
            } as any,
            { debug: jest.fn() } as any,
            {} as any,
        );
        mockRead = {
            getUserReader: jest.fn().mockReturnValue({
                getAppUser: jest.fn().mockResolvedValue({ username: 'greeting-bot' }),
            }),
        };
        mockHttp = {};
        mockPersistence = {};
        mockMessageBuilder = {
            setRoom: jest.fn().mockReturnThis(),
            setSender: jest.fn().mockReturnThis(),
            setText: jest.fn().mockReturnThis(),
        };
        mockModify = {
            getCreator: jest.fn().mockReturnValue({
                startMessage: jest.fn().mockReturnValue(mockMessageBuilder),
                finish: jest.fn().mockResolvedValue('id'),
            }),
        };
    });

    test('responds with a greeting when message contains hello', async () => {
        const message: IMessage = {
            sender: { type: UserType.USER, username: 'testuser' } as any,
            text: 'hello world',
            room: {} as any,
        };

        await app.executePostMessageSent(message, mockRead, mockHttp, mockPersistence, mockModify);

        expect(mockModify.getCreator().startMessage).toHaveBeenCalled();
        expect(mockMessageBuilder.setText).toHaveBeenCalledWith('Hello @testuser, how can I help you today?');
        expect(mockModify.getCreator().finish).toHaveBeenCalled();
    });

    test('does not respond when message does not contain hello', async () => {
        const message: IMessage = {
            sender: { type: UserType.USER, username: 'testuser' } as any,
            text: 'hi there',
            room: {} as any,
        };

        await app.executePostMessageSent(message, mockRead, mockHttp, mockPersistence, mockModify);

        expect(mockModify.getCreator().startMessage).not.toHaveBeenCalled();
    });

    test('does not respond to bot messages', async () => {
        const message: IMessage = {
            sender: { type: UserType.BOT, username: 'another-bot' } as any,
            text: 'hello bot',
            room: {} as any,
        };

        await app.executePostMessageSent(message, mockRead, mockHttp, mockPersistence, mockModify);

        expect(mockModify.getCreator().startMessage).not.toHaveBeenCalled();
    });
});
