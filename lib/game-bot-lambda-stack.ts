import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Function,
  AssetCode,
  Runtime,
  FunctionUrl,
  FunctionUrlAuthType,
} from "aws-cdk-lib/aws-lambda";
import * as path from "node:path";

export class GameBotLambdaStack extends cdk.Stack {
  private readonly lambdaFunction: string = "GameBotLambda";
  private readonly lambdaFunctionUrl: string = "GameBotLambdaUrl";

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ld = new Function(this, this.lambdaFunction, {
      code: new AssetCode(path.join(__dirname, "../resources/lambda")),
      runtime: Runtime.NODEJS_18_X,
      handler: "dist/handler/handler.lambdaHandler",
      functionName: this.lambdaFunction,
      description: "Discord Bot Handler",
      environment: {
        DISCORD_CLIENT_PUBLIC_KEY: process.env.DISCORD_CLIENT_PUBLIC_KEY!,
      },
    });

    const fnUrl = new FunctionUrl(this, this.lambdaFunctionUrl, {
      function: ld,
      authType: FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, "LambdaFunctionUrl", {
      value: fnUrl.url,
      description: "The URL of the Lambda Function",
    });
  }
}
