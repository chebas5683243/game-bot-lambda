#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GameBotLambdaStack } from "../lib/game-bot-lambda-stack";
import * as dotenv from "dotenv";

dotenv.config();

const app = new cdk.App();
new GameBotLambdaStack(app, "GameBotLambdaStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
