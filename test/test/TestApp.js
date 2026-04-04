"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestApp = void 0;
const App_1 = require("@rocket.chat/apps-engine/definition/App");
class TestApp extends App_1.App {
    constructor(info, logger, accessors) {
        super(info, logger, accessors);
    }
    async executePostMessageSent(message, read, http, persistence, modify) {
        if (!message.text || !message.text.toLowerCase().includes('hello')) {
            return;
        }
        const sender = await read.getUserReader().getAppUser();
        if (!sender) {
            return;
        }
        if (message.sender.id === sender.id) {
            return;
        }
        const builder = modify.getCreator().startMessage()
            .setSender(sender)
            .setRoom(message.room)
            .setText(`Hello @${message.sender.username}, how can I help you today?`);
        await modify.getCreator().finish(builder);
    }
}
exports.TestApp = TestApp;
