import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, type ButtonInteraction, type GuildMember } from 'discord.js';

@ApplyOptions({
    name: "activity-button",
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
        const modal = new ModalBuilder()
            .setCustomId("activity-modal")
            .setTitle("Activity Submission");
        
            const businessName = new TextInputBuilder()
              .setCustomId("businessName")
              .setLabel("Business")
              .setPlaceholder("Spectra Pipeline Management")
              .setStyle(TextInputStyle.Short);
        
            const propertyDistrict = new TextInputBuilder()
              .setCustomId("propertyDistrict")
              .setLabel("Property District")
              .setPlaceholder("Redwood, Prominence, Unincorporated Areas & Prominence\nALT: Farms, Hillview, Greendale")
              .setStyle(TextInputStyle.Short);
        
            const propertyActivity = new TextInputBuilder()
              .setCustomId("propertyActivity")
              .setLabel("Property Activity Evidence")
              .setPlaceholder("[LINK]")
              .setStyle(TextInputStyle.Paragraph);
        
            const additionalInformation = new TextInputBuilder()
              .setCustomId("additionalInformation")
              .setLabel("Additional Information")
              .setPlaceholder("Default: N/A")
              .setStyle(TextInputStyle.Paragraph);
        
            const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(businessName);
            const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(propertyDistrict);
            const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(propertyActivity);
            const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(additionalInformation);
        
            modal.addComponents(
              firstActionRow,
              secondActionRow,
              thirdActionRow,
              fourthActionRow
            );
        
            return await interaction.showModal(modal);
    }
}