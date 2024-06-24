import * as lambda from "aws-lambda";
import { logger } from "./logging";
import * as nacl from "tweetnacl";
import {
  APIInteraction,
  APIInteractionResponse,
  APIApplicationCommand,
  InteractionType,
  APIInteractionDataOptionBase,
  ApplicationCommandOptionType,
} from "discord-api-types/payloads/v9";
import { Service } from "./service";

export interface ControllerProps {
  service: Service;
}

export class Controller {
  constructor(protected props: ControllerProps) {}

  private parseRequestBody(event: lambda.LambdaFunctionURLEvent): any {
    if (typeof event.body === "string") {
      return JSON.parse(event.body);
    }

    return event.body;
  }

  private verifyDiscordRequest(event: lambda.LambdaFunctionURLEvent) {
    const signature = event.headers["x-signature-ed25519"] ?? "";
    const timestamp = event.headers["x-signature-timestamp"] ?? "";

    if (!signature || !timestamp) {
      return false;
    }

    const clientPublicKey = process.env.DISCORD_CLIENT_PUBLIC_KEY ?? "";

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + event.body),
      Buffer.from(signature, "hex"),
      Buffer.from(clientPublicKey, "hex")
    );

    return isVerified;
  }

  async get(event: any): Promise<lambda.APIGatewayProxyResult> {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Hello World!",
      }),
    };
  }

  async interactions(
    event: lambda.LambdaFunctionURLEvent
  ): Promise<lambda.LambdaFunctionURLResult> {
    if (!this.verifyDiscordRequest(event)) {
      logger.error("Request verification failed");
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Request verification failed",
        }),
      };
    }

    const body = this.parseRequestBody(event) as APIInteraction;

    let response: APIInteractionResponse = {
      type: 4,
      data: {
        content: "Unknown interaction",
      },
    };

    if (body.type === InteractionType.Ping) {
      response = this.props.service.handlePingInteraction();
    }

    if (body.type === InteractionType.ApplicationCommand) {
      response = this.props.service.handleApplicationCommandInteraction(body);
    }

    if (body.type === InteractionType.MessageComponent) {
      response = this.props.service.handleMessageComponentInteraction(body);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  }
}

export const controller = new Controller({
  service: new Service(),
});
