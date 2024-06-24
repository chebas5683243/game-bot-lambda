import "source-map-support/register";
import { dispatcher } from "./LambdaDispatcher";
import { controller } from "../controller";

dispatcher.get("/", (event) => controller.get(event));

dispatcher.post("/interactions", (event) => controller.interactions(event));

export const lambdaHandler = async (event: any) => dispatcher.handler(event);
