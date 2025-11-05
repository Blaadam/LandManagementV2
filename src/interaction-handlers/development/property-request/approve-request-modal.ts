import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    TextChannel,
    type ModalSubmitInteraction,
} from "discord.js";
import "dotenv";
require("dotenv").config();

import { ApplyOptions } from "@sapphire/decorators";

const PERMITTED_EXTENSIONS = [".rbxm"];
const UPLOAD_CHANNEL = global.ChannelIDs.devSupportTickets;

function SpliceUsername(username: string) {
    var spliced = username.split(" ")
    return spliced[spliced.length - 1]
}

@ApplyOptions({
    name: "approve-request-modal",
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
        if (!interaction.customId.startsWith(this.name)) {
            return this.none();
        }

        return this.some();
    }

    public async run(interaction: ModalSubmitInteraction) {
        const propertyFile = interaction.fields.getUploadedFiles("propertyFile", true).first();

        const customId = interaction.customId;
        const messageId = customId.replace("approve-request-modal-", "");

        const channel = interaction.client.channels.cache.get(UPLOAD_CHANNEL) as TextChannel;
        const message = await channel.messages.fetch(messageId);

        const submitter = message.mentions.users.first();
        const embed = message.embeds[0];
        const landPermit = embed.fields.find(field => field.name === "Land Permit")?.value || "unknown";

        const dmChannel = await submitter.createDM();
        await dmChannel.send({
            content: `Your property submission has been approved by ${interaction.user.toString()}.`,
            embeds: [embed],
            files: propertyFile ? [propertyFile] : [],
        });

        const newEmbed = new EmbedBuilder(embed)
            .setColor(global.embeds.embedColors.success)
            .setFooter({ text: `Approved by ${interaction.user.tag}` })
            .setTimestamp();

        await message.edit({
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
