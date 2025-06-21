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

const Settings = {
  ChannelId: "1089647073852403802", // Channel ID for incoming requests
  AreaListIds: {
    // Default Cities
    "Redwood": ["641e1077958b7e7aeb847a48"],
    "Arborfield": ["641e108a923770039e58f70b"],
    "Prominence": ["641e108172f11b32b2cd1d7a"],

    // Unincorporated Areas
    "Unincorporated": ["641e15dc99f278f73fcfbb9e"],
    "Greendale": ["641e174a2bdd24d0cb8ac85f", "Unincorporated"],
    "Hillview": ["641e17536f76c164213b94b0", "Unincorporated"],

    // Stadium Lots
    "Triumph Stadium": ["641e16219cd033f2188ff043", "Prominence"],
    "Lunar Arena": ["64c99bd2e6ac1002eda1ae5b", "Prominence"],
  },
  LabelIds: {
    "Prominence": ["641e0d512e15ff6a3be2b6ba"],
    "Redwood": ["641e0d6a7c2b18c899627dcf"],
    "Arborfield": ["641e0d784e470de8bccd151e"],
    "Unincorporated": ["6423ba519eaba3c931bd402f"],
  }
}

async function PublishCard(Title, Description, Labels, Managers) {
  var url = `https://api.trello.com/1/cards${ADDON}`

  let response = await axios({
    "method": 'post',
    "url": url,
    data: {
      "name": Title,
      "desc": Description,
      "idList": "642e6003d62b62d1077a74c9",
      "idLabels": Labels || null,
      "idMembers": Managers || null
    },
    headers: { "Content-Type": "application/json" }
  })

  return response.data
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
  name: "activityModal",
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

    var DateS = new Date()

    // Pushes the card to trello
    var NewCard = await PublishCard(businessName,
      "#Land Request\n\n" +
      "---\n\n" +
      `**Submitted at**: ${DateS.toUTCString()}\n` +
      `**Submitter**: ${robloxName}\n\n` +
      "---\n\n" +
      `**Property District**: ${District}\n` +
      `**Property Activity**: ${propertyActivity}\n\n` +
      "---\n\n" +
      `**Additional Information**: ${additionalInformation}\n`,
      Settings.LabelIds[District],
      // trello ids of the managers
      DistrictManagers.map((manager) => manager.TrelloId
      ) || null
    )

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
        { name: "Trello Link", value: NewCard.shortUrl },
      )
      .setTimestamp()
      .setColor(global.embeds.embedColor.activity)
      .setFooter(global.embeds.embedFooter);

    // Create a link button
    const incomingRequestButton = new ButtonBuilder()
      .setLabel("Request")
      .setURL(NewCard.shortUrl)
      .setStyle(ButtonStyle.Link);

    // Create an action row to store the button
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(incomingRequestButton);

    // Send the content to the channel
    const channel = await interaction.client.channels.fetch(Settings.ChannelId) as TextChannel;
    channel.send({ content: DistrictManager, embeds: [newEmbed], components: [row] });

    // Client returner
    return interaction.reply({
      content: "Your submission was received successfully!",
      ephemeral: true,
    });
  }
}
