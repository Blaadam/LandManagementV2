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
import axios from "axios";
require("dotenv").config();

import { databaseConnection } from "../../database";
import { ApplyOptions } from "@sapphire/decorators";
const connection = new databaseConnection();

const TRELLO_KEY = process.env.TRELLO_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const ADDON = `?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`

const ACTIVE_LIST_ID = "641e10486e814e91bb2f6d31"

async function CommentOnTrelloCardID(cardId: string, comment: string) {
    var url = `https://api.trello.com/1/cards/${cardId}/actions/comments${ADDON}`

    let response = await axios({
        "method": 'post',
        "url": url,
        data: {
            "text": comment
        },
        headers: { "Content-Type": "application/json" }
    })

    return response.data
}

async function FindTrelloCardFromName(query: string) {
    var url = `https://api.trello.com/1/search${ADDON}`

    let response = await axios({
        "method": 'get',
        "url": url,
        params: {
            query: query,
            idBoards: ["641e058f71db0c8ed6abecd7"],
            modelTypes: "cards",
            card_fields: "name,shortUrl,closed,idList",
            cards_limit: 5
        },
        headers: { "Content-Type": "application/json" }
    })

    if (response.data.cards.length == 0) return null

    // find first card that isnt archived
    var card
    for (let i = 0; i < response.data.cards.length; i++) {
        console.log(response.data.cards[i])
        console.log(response.data.cards[i].idList, ACTIVE_LIST_ID)

        if (response.data.cards[i].idList == ACTIVE_LIST_ID && !response.data.cards[i].closed) {
           card = response.data.cards[i]
            break;
        }
    }

    return card;
}

function SpliceUsername(Username) {
    var Spliced = Username.split(" ")
    return Spliced[Spliced.length - 1]
}

// Grabs the manager for a district
async function GetManagersFromDistrict(district: string) {
    var table = connection.prisma.managerTable

    var rows = await table.findMany({ where: { District: district } });
    return rows;
}

function AutoCorrectDistrictInput(Input) {
    var Capitalised = Input.toUpperCase()

    if (Capitalised == "REDWOOD") { return "Redwood" }
    else if (Capitalised == "ARBORFIELD") { return "Arborfield" }
    else if (Capitalised == "PROMINENCE") { return "Prominence" }
    else if (Capitalised == "UNINCORPORATED") { return "Unincorporated" }

    else if (Capitalised == "FARMS") { return "Unincorporated" }
    else if (Capitalised == "HILLVIEW") { return "Unincorporated" }
    else if (Capitalised == "GREENDALE") { return "Unincorporated" }
}

@ApplyOptions({
    name: "activity-modal",
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
        const businessName = interaction.fields.getTextInputValue("businessName");
        const propertyDistrict = interaction.fields.getTextInputValue("propertyDistrict");
        const propertyActivity = interaction.fields.getTextInputValue("propertyActivity");
        const additionalInformation = interaction.fields.getTextInputValue("additionalInformation");

        if (!businessName || !propertyDistrict || !propertyActivity || !additionalInformation) {
            return interaction.reply({
                content: "You did not fill in the fields correctly.",
                ephemeral: true,
            });
        }

        const robloxName = SpliceUsername(interaction.user.displayName)
        const District = AutoCorrectDistrictInput(propertyDistrict)

        // Grab the information of the property
        const DistrictManagers = await GetManagersFromDistrict(District)

        if (!DistrictManagers) {
            return interaction.reply({
                content: `Unable to find district manager for \`\`${propertyDistrict}\`\`.\nContact [Tecxera](https://discord.gg/5SdTjEKCdM).`,
                ephemeral: true,
            });
        }

        var DistrictManager = ""

        for (let row in DistrictManagers) {
            DistrictManager += `<@${DistrictManagers[row].DiscordId}> `
        }

        const query = `${District} ${businessName}`

        // Get the current card
        var ExistingCard = await FindTrelloCardFromName(query)
        if (!ExistingCard) {
            return interaction.reply({
                content: `Unable to find a Trello card with the query \`\`${query}\`\`. Please ensure the business name is correct.`,
                ephemeral: true,
            });
        }

        // Comment on the existing card
        var currentTime = new Date();
        await CommentOnTrelloCardID(ExistingCard.id,
            "##Land Activity\n\n" +

            `**Submitted at**: ${currentTime.toUTCString()}\n` +
            `**Submitter**: ${robloxName}\n\n` +

            `**Property District**: ${District}\n` +
            `**Property Activity**: ${propertyActivity}\n\n` +

            `**Additional Information**: ${additionalInformation}`
        );

        // Make an embed for content data
        const newEmbed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.tag,
                iconURL:
                    interaction.user.displayAvatarURL({ extension: "png", size: 512 }),
            })
            .setTitle("New Property Activity Submission")
            .addFields(
                { name: "Business", value: businessName },
                { name: "Roblox Name", value: robloxName },
                { name: "Property District", value: District },
                { name: "Property Link", value: ExistingCard.shortUrl },
            )
            .setTimestamp()
            .setColor(global.embeds.embedColors.activity)
            .setFooter(global.embeds.embedFooter);

        const incomingRequestButton = new ButtonBuilder()
            .setLabel("Property Card")
            .setURL(ExistingCard.shortUrl)
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(incomingRequestButton);

        const channel = await interaction.client.channels.fetch(global.ChannelIDs.landSubmissions) as TextChannel;
        if (channel) {
            channel.send({ content: DistrictManager, embeds: [newEmbed], components: [row] });
        }

        return interaction.reply({
            content: `Your submission was received successfully and has been added to the existing Trello card. Check the card [here](${ExistingCard.shortUrl}).`,
            ephemeral: true,
        });
    }
}
