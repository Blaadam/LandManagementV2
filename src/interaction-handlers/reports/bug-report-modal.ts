import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import {
    EmbedBuilder,
    type ModalSubmitInteraction,
} from "discord.js";
import "dotenv";
require("dotenv").config();

import { ApplyOptions } from "@sapphire/decorators";

const receivingUser = "251442524516909058"

@ApplyOptions({
    name: "bug-report-modal",
})
export class ModalHandler extends InteractionHandler {
    public constructor(
        ctx: InteractionHandler.LoaderContext,
        options: InteractionHandler.Options
    ) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
        });
    }

    public override parse(interaction: ModalSubmitInteraction) {
        if (interaction.customId !== this.name) return this.none();

        return this.some();
    }

    public async run(interaction: ModalSubmitInteraction) {
        const bugTitle = interaction.fields.getTextInputValue("bugTitle");
        const bugDesc = interaction.fields.getTextInputValue("bugDesc");

        if (!bugTitle || !bugDesc) {
            return interaction.reply({
                content: "You did not fill in the fields correctly.",
                flags: ["Ephemeral"],
            });
        }

        // Make an embed for content data
        const newEmbed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.tag,
                iconURL:
                    interaction.user.displayAvatarURL({ extension: "png", size: 512 }),
            })
            .setTitle("New Bug Report Submission")
            .addFields(
                { name: "Bug Title", value: bugTitle },
                { name: "Bug Description", value: bugDesc },
            )
            .setTimestamp()
            .setColor(global.embeds.embedColors.activity)
            .setFooter(global.embeds.embedFooter);

        const user = await interaction.client.users.fetch(receivingUser);
        if (!user) {
            return interaction.reply({
                content: "The receiving user could not be found.",
                flags: ["Ephemeral"],
            });
        }

        // Send the embed to the receiving user
        const dmChannel = await user.createDM();
        await dmChannel.send({ content: `<@${interaction.user.id}>`, embeds: [newEmbed] });

        return interaction.reply({
            content: `Your submission was received successfully and has been forwarded to support.`,
            flags: ["Ephemeral"],
        });
    }
}
