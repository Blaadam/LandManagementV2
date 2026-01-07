import { Listener } from '@sapphire/framework';
import { Interaction } from 'discord.js';
import * as Sentry from '@sentry/node';

function getInteractionType(interaction: Interaction) {
  if (interaction.isCommand()) return 'Command';
  if (interaction.isButton()) return 'Button';
  if (interaction.isModalSubmit()) return 'ModalSubmit';
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
    Sentry.metrics.count('interaction.create.count', 1, {
      attributes: {
        interactionId: interaction.id,
        interactionType: getInteractionType(interaction),

        user: {
          id: interaction.user.id,
          username: interaction.user.username
        }
      }
    });
  }
}