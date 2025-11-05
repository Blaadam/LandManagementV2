import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, Embed, EmbedBuilder, FileUploadBuilder, LabelBuilder, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, User, type ButtonInteraction, type GuildMember } from 'discord.js';

@ApplyOptions({
  name: "approve-property-request",
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
    const messageId = interaction.message.id;
    const submitter: User = interaction.message.mentions.users.first();
    const embed: Embed = interaction.message.embeds[0];

    const landPermit = embed.fields.find(field => field.name === "Land Permit")?.value || "unknown";

    const approveModal = new ModalBuilder()
      .setCustomId(`approve-request-modal-${messageId}`)
      .setTitle("Approve Property Request");

    const approveTextDisplay = new TextDisplayBuilder()
      .setContent(`You are approving the property request by **${submitter.tag}**.\nPlease attach the property file below.`);

    const propertyFileUploadLabel = new LabelBuilder()
      .setLabel("Property File Upload")
      .setFileUploadComponent(
        new FileUploadBuilder()
          .setCustomId("propertyFile")
          .setRequired(true)
      );

    approveModal.addTextDisplayComponents(approveTextDisplay);
    approveModal.addLabelComponents(propertyFileUploadLabel);

    await interaction.showModal(approveModal);
  }
}