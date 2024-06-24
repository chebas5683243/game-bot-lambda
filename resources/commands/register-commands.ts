import * as commands from "./commands.json";
import axios, { AxiosError } from "axios";

import dotenv from "dotenv";

dotenv.config();

async function registerCommands() {
  try {
    const applicationId = process.env.DISCORD_APPLICATION_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const commandsEndpoint = `https://discord.com/api/v10/applications/${applicationId}/commands`;

    if (!applicationId || !botToken) {
      console.error("Missing environment variables");
      return;
    }

    await axios.put(commandsEndpoint, commands.commands, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    console.log("Commands registered successfully!");
  } catch (error) {
    console.log("ups");
    const axiosError = error as AxiosError;
    console.error((axiosError.response?.data as any).errors.name);
  }
}

registerCommands();
