import { Listener } from '@sapphire/framework';
import { ButtonInteraction, ChatInputCommandInteraction, Interaction, ModalSubmitInteraction } from 'discord.js';
import * as Sentry from '@sentry/node';

function getInteractionType(interaction: Interaction) {
  if (interaction.isCommand()) return 'Command';
  if (interaction.isButton()) return 'Button';
  if (interaction.isModalSubmit()) return 'ModalSubmit';
  if (interaction.isContextMenuCommand()) return 'ContextMenuCommand';
  if (interaction.isAutocomplete()) return 'Autocomplete';
  if (interaction.isStringSelectMenu()) return 'StringSelectMenu';
  if (interaction.isUserSelectMenu()) return 'UserSelectMenu';
  if (interaction.isRoleSelectMenu()) return 'RoleSelectMenu';
  if (interaction.isMentionableSelectMenu()) return 'MentionableSelectMenu';
  if (interaction.isChannelSelectMenu()) return 'ChannelSelectMenu';
  return 'Unknown';
}

export class UserEvent extends Listener {
  constructor(context, options = {}) {
    super(context, {
      ...options,
      event: 'interactionCreate',
      once: false
    });
  }

  async run(interaction: Interaction) {
    const interactionType = getInteractionType(interaction)

    const data = {
      "interaction.id": interaction.id,
      "interaction.type": interactionType || interaction.type,
      "interaction.createdTimestamp": interaction.createdTimestamp,
      "interaction.locale": interaction.locale,

      "user.id": interaction.user.id,
      "user.username": interaction.user.username,

      "guild.id": interaction.guild?.id || 'DM',
      "guild.name": interaction.guild?.name || 'DM',

      "channel.id": interaction.channel?.id || 'DM',
      "channel.type": interaction.channel?.type || 'Text',
      "channel.name": interaction.channel?.name || 'DM',
    }

    Sentry.metrics.count('interaction.create.count', 1, {
      attributes: data
    });

    if (interaction.isModalSubmit()) {
      const modalInteraction = interaction as ModalSubmitInteraction;
      data['interaction.customId'] = modalInteraction.customId;
      data["interaction.fields"] = modalInteraction.fields.fields;
    }
    else if (interaction.isCommand()) {
      const chatInputInteraction = interaction as ChatInputCommandInteraction;
      data['interaction.commandName'] = chatInputInteraction.commandName;
      data["interaction.options"] = chatInputInteraction.options.data.map(option => ({
        name: option.name,
        type: option.type,
        value: option.value
      }));
    }
    else if (interaction.isButton()) {
      const buttonInteraction = interaction as ButtonInteraction;
      data['interaction.customId'] = buttonInteraction.customId;
      data['interaction.messageId'] = buttonInteraction.message.id;
    }


    Sentry.logger.trace('Interaction Created', data);
  }
}