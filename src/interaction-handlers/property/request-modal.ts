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

function GetDistrictFromID(ListID) {
  var District = ""
  for (let key in Settings.AreaListIds) {
    var Data = Settings.AreaListIds[key]
    if (Data[0] == ListID) {
      District = Data[1] || key
      break
    }
  }
  if (District == "") {
    return null
  }
  return District
}

@ApplyOptions({
  name: "requestModal",
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
    const businessPermit = interaction.fields.getTextInputValue("businessPermit");
    const businessGroup = interaction.fields.getTextInputValue("businessGroup");
    const propertiesBefore = interaction.fields.getTextInputValue("propertiesBefore");
    const requestedLand = interaction.fields.getTextInputValue("requestedLand");
    const propertyUse = interaction.fields.getTextInputValue("propertyUse");

    // If any value is null, instantly return.
    if (!businessPermit || !businessGroup || !propertiesBefore || !requestedLand || !propertyUse) {
      return interaction.reply({
        content: "You did not fill in the field correctly.",
        ephemeral: true,
      });
    }

    const robloxName = SpliceUsername(interaction.user.displayName)

    if (!requestedLand.search("trello.com/c/")) {
      return interaction.reply({
        content: "You did not specify a trello link.",
        ephemeral: true,
      });
    }

    // Split the string at "/c/" for ease
    let CardTitle = requestedLand.split("/c/")
    if (!CardTitle[1]) {
      return interaction.reply({
        content: "You did not specify a trello link.\nContact a BLM Service Manager if this is a mistake.",
        ephemeral: true,
      });
    }

    // Split directly after with "/" as the first element will be the ID of the card.
    var CardID = CardTitle[1].split("/")[0]

    const response = await axios({
      method: "get",
      url: `https://trello.com/1/cards/${CardID}/`,
      headers: {
        "Accept": "application/json"
      }
    })

    // Grab the name of the district from the parented list
    const District = GetDistrictFromID(response.data.idList)

    if (!District) {
      return interaction.reply({
        content: "Unable to find district.\nContact a BLM Service Manager if this is a mistake.",
        ephemeral: true,
      });
    }

    // Grab the information of the property
    const DistrictManagers = await GetManagersFromDistrict(District)

    if (!DistrictManagers) {
      return interaction.reply({
        content: "Unable to find district manager.\nContact a BLM Service Manager if this is a mistake.",
        ephemeral: true,
      });
    }

    var DistrictManager = ""

    // District managers id's stored in an array for tagging
    for (let row in DistrictManagers) {
      DistrictManager += `<@${DistrictManagers[row].DiscordId}> `
    }

    var DateS = new Date()

    // Pushes the card to trello
    var NewCard = await PublishCard(robloxName,
      "#Land Request\n\n" +
      "---\n\n" +
      `**Submitted at**: ${DateS.toUTCString()}\n` +
      `**Submitter**: ${robloxName}\n` +
      `**Property District**: ${District}\n` +
      `**Property Number**: ${propertiesBefore}\n\n` +
      "---\n\n" +
      `**Business Permit**: ${businessPermit}\n` +
      `**Business Group**: ${businessGroup}\n` +
      `**Requested Property**: ${requestedLand}\n\n` +
      "---\n\n" +
      `**Property Use**: ${propertyUse}`,
      Settings.LabelIds[District],
      // Trello ids of the managers
      DistrictManagers.map((manager) => manager.TrelloId) || null
    )

    // Make an embed for content data
    const newEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.tag,
        iconURL:
          interaction.user.displayAvatarURL({ extension: "png", size: 512 }),
      })
      .setTitle("New Property Request Submission")
      .addFields(
        { name: "Roblox Name", value: robloxName },
        { name: "Property District", value: District },
        { name: "Requested Land", value: requestedLand },
        { name: "Trello Link", value: NewCard.shortUrl },
      )
      .setTimestamp()
      .setColor(global.embeds.embedColors.activity)
      .setFooter(global.embeds.embedFooter);

    // Create a link button
    const incomingRequestButton = new ButtonBuilder()
      .setLabel("Request")
      .setURL(NewCard.shortUrl)
      .setStyle(ButtonStyle.Link);

    // Create an action row to store the button
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(incomingRequestButton);

    // Send the content to the channel
    const channel = await interaction.client.channels.fetch(global.ChannelIDs.landSubmissions) as TextChannel;
    channel.send({ content: DistrictManager, embeds: [newEmbed], components: [row] });

    // Client returner
    return interaction.reply({
      content: "Your submission was received successfully!",
      ephemeral: true,
    });
  }
}
