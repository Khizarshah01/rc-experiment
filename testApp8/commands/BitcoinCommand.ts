import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';

export class BitcoinCommand implements ISlashCommand {
    public command = 'bitcoin';
    public i18nParamsExample = '';
    public i18nDescription = 'Get the current Bitcoin price in INR';
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<void> {
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr';
        const response = await http.get(url);

        if (response.statusCode !== 200 || !response.data || !response.data.bitcoin) {
            const errorMessage = modify.getCreator().startMessage()
                .setRoom(context.getRoom())
                .setSender(context.getSender())
                .setText('Error fetching Bitcoin price. Please try again later.');
            await modify.getCreator().finish(errorMessage);
            return;
        }

        const price = response.data.bitcoin.inr;
        const message = `The current price of Bitcoin is ₹${price.toLocaleString('en-IN')}`;

        const builder = modify.getCreator().startMessage()
            .setRoom(context.getRoom())
            .setSender(context.getSender())
            .setText(message);

        await modify.getCreator().finish(builder);
    }
}
