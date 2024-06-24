import * as lambda from "aws-lambda";
import {
  APIApplicationCommand,
  APIApplicationCommandInteraction,
  APIInteractionDataOptionBase,
  APIInteractionResponse,
  APIMessageComponentInteraction,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { logger } from "./logging";

type OptionType = APIInteractionDataOptionBase<
  ApplicationCommandOptionType.String,
  string
>;

export class Service {
  handlePingInteraction(): APIInteractionResponse {
    return {
      type: 1,
    };
  }

  handleApplicationCommandInteraction(
    interaction: APIApplicationCommandInteraction
  ): APIInteractionResponse {
    const command = interaction.data as APIApplicationCommand;

    let response: APIInteractionResponse = {
      type: 4,
      data: {
        content: "Unknown command",
      },
    };

    if (command.name === "goodbye") {
      response = {
        type: 4,
        data: {
          tts: false,
          content: "Au revoir",
        },
      };
    } else if (command.name === "hello") {
      response = {
        type: 4,
        data: {
          tts: true,
          content: "Hola Mamatoñi!",
        },
      };
    } else if (command.name === "new-game") {
      const selectedOption = command.options?.find(
        (option) => option.name === "game"
      ) as any as OptionType;

      if (selectedOption?.value === "tetris") {
        response = {
          type: 4,
          data: {
            content: "Starting Tetris game",
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    label: "Open game",
                    style: 3,
                    custom_id: "open_tetris",
                    emoji: {
                      name: "🎮",
                    },
                  },
                ],
              },
            ],
          },
        };
      } else {
        response = {
          type: 4,
          data: {
            content: "Unknown game",
          },
        };
      }
    }

    logger.info("respones", response as any);

    return response;
  }

  handleMessageComponentInteraction(
    interaction: APIMessageComponentInteraction
  ): APIInteractionResponse {
    let response: APIInteractionResponse = {
      type: 4,
      data: {
        content: "Unknown interaction",
      },
    };

    if (interaction.data.custom_id === "open_tetris") {
      logger.info("Opening Tetris modal");
      response = {
        type: 9,
        data: {
          custom_id: "tetris_modal",
          title: "Tetris",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "input_1",
                  style: 1,
                  label: "Input your text here",
                  placeholder: "Type something...",
                  required: true,
                },
              ],
            },
          ],
        },
      };
    } else {
      // Handle other interactions if necessary
      response = {
        type: 4, // Type 4 indicates a channel message
        data: {
          content: "Button clicked!",
        },
      };
    }

    return response;
  }
}

export const service = new Service();
