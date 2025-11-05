import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, Embed, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, User, type ButtonInteraction, type GuildMember } from 'discord.js';

@ApplyOptions({
  name: "approve-property-submission",
})
export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== this.name) return this.none();

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const submitter: User = interaction.message.mentions.users.first();
    const embed: Embed = interaction.message.embeds[0];

    const landPermit = embed.fields.find(field => field.name === "Land Permit")?.value || "unknown";

    await submitter.send({
      content: `Your property submission has been approved by ${interaction.user.toString()}.`,
      embeds: [embed],
    });

    const newEmbed = new EmbedBuilder(embed)
      .setColor(global.embeds.embedColors.success)
      .setFooter({ text: `Approved by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.message.edit({
      content: `This property submission has been approved by ${interaction.user.toString()}.`,
      components: [],
      embeds: [newEmbed],
    });

    return interaction.reply({
      content: `You have approved the property submission for ${landPermit}.`,
      flags: ["Ephemeral"],
    });

  }
}