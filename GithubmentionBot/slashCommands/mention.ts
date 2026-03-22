import {
  IHttp,
  IModify,
  IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
  ISlashCommand,
  SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { IPersistence } from '@rocket.chat/apps-engine/definition/accessors';
import {
  RocketChatAssociationModel,
  RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';

export class Mention implements ISlashCommand {
  public command = 'khizarshah01';
  public i18nParamsExample = 'on/off';
  public i18nDescription = 'Enable or disable GitHub mention replies';
  public providesPreview = false;

  private async sendMessage(context: SlashCommandContext, modify: IModify, message: string): Promise<void> {
    const sender = context.getSender();
    const room = context.getRoom();
    const builder = modify.getCreator().startMessage();

    builder
      .setRoom(room)
      .setText(message);

    await modify.getNotifier().notifyUser(sender, builder.getMessage());
  }

  public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {

    const [subcommand] = context.getArguments();

    if (!subcommand) {
      throw new Error('Error!');
    }

    switch (subcommand) {
      case 'on': {
        const user = context.getSender();

        const association = new RocketChatAssociationRecord(
          RocketChatAssociationModel.MISC,
          'githubmention'
        );

        await persistence.updateByAssociation(
          association,
          { enabled: true },
          true
        );

        await this.sendMessage(context, modify, 'khizarshah01 mention is on');
        break;
      }

      case 'off': {
        const user = context.getSender();

        const association = new RocketChatAssociationRecord(
          RocketChatAssociationModel.MISC,
          'githubmention'
        );

        await persistence.updateByAssociation(
          association,
          { enabled: false },
          true
        );

        await this.sendMessage(context, modify, 'khizarshah01 mention is off');
        break;
      }
      default:
        throw new Error('Error!');
    }
  }
}
