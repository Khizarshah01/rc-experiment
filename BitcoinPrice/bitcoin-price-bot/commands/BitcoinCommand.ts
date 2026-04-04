import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';

export class BitcoinCommand implements ISlashCommand {
    public command = 'bitcoin';
    public i18nParamsExample = '';
    public i18nDescription = 'Get the current Bitcoin price';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const response = await http.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');

        if (!response || response.statusCode !== 200 || !response.data || !response.data.bitcoin || !response.data.bitcoin.usd) {
            await this.sendMessage(context, read, modify, 'Sorry, I could not fetch the Bitcoin price at the moment.');
            return;
        }

        const price = response.data.bitcoin.usd;
        const message = `The current Bitcoin price is $${price} USD.`;

        await this.sendMessage(context, read, modify, message);
    }

    private async sendMessage(context: SlashCommandContext, read: IRead, modify: IModify, text: string): Promise<void> {
        const appUser = await read.getUserReader().getAppUser();
        const builder = modify.getCreator().startMessage();
        builder.setSender(appUser || context.getSender())
            .setRoom(context.getRoom())
            .setText(text);

        await modify.getCreator().finish(builder);
    }
}
