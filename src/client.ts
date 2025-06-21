import {
  SapphireClient,
  LogLevel,
  ApplicationCommandRegistries,
  RegisterBehavior,
} from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

export default class Client extends SapphireClient {
  public constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
      ],
      logger: {
        level: LogLevel.Info,
      },
    });
  }

  public override login(token?: string) {
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
      RegisterBehavior.BulkOverwrite
    );

    return super.login(token);
  }
}

//// CONFIGURATION ////

global.embeds = {
  embedColors: {
    mgmt: "#6c584b",
    activity: "#9E9885",
    default: "#244837",
    error: "#ff0000",
    success: "#00ff00",
  },
  embedFooter: {
    text: "Service Management Centre",
    iconURL:
      "https://i.imgur.com/cfI0qUe.jpg",
  },
};

global.ChannelIDs = {
  deadlineAnnouncements: "735894843259355294",
  landSubmissions: "1089647073852403802",
};

global.mainServer = "735894836577697913";

//// END OF CONFIGURATION ////

ApplicationCommandRegistries.setDefaultGuildIds([global.mainServer]);
