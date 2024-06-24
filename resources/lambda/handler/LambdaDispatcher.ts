import * as lambda from "aws-lambda";
import { logger } from "../logging";

export type ApiHandler = (
  event: lambda.LambdaFunctionURLEvent
) => Promise<lambda.LambdaFunctionURLResult>;

enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export class LambdaDispatcher {
  private apiHandlers = new Map<string, ApiHandler>();

  get(resource: string, handler: ApiHandler) {
    this.apiHandlers.set(`${HttpMethod.GET}${resource}`, handler);
  }

  post(resource: string, handler: ApiHandler) {
    this.apiHandlers.set(`${HttpMethod.POST}${resource}`, handler);
  }

  patch(resource: string, handler: ApiHandler) {
    this.apiHandlers.set(`${HttpMethod.PATCH}${resource}`, handler);
  }

  update(resource: string, handler: ApiHandler) {
    this.apiHandlers.set(`${HttpMethod.UPDATE}${resource}`, handler);
  }

  delete(resource: string, handler: ApiHandler) {
    this.apiHandlers.set(`${HttpMethod.DELETE}${resource}`, handler);
  }

  async handler(event: lambda.LambdaFunctionURLEvent) {
    const http = event.requestContext.http;

    logger.info("Request information", {
      http,
      queryStringParameters: event.queryStringParameters,
      body: JSON.parse(event.body!),
    });

    const apiHandler = this.apiHandlers.get(`${http.method}${http.path}`);

    if (apiHandler) {
      return apiHandler(event);
    }

    return Promise.resolve();
  }
}

export const dispatcher = new LambdaDispatcher();
