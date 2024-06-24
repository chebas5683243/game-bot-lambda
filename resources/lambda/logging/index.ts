import { Logger as LoggerLibrary } from "@aws-lambda-powertools/logger";
import type {
  ConstructorOptions,
  LogItemMessage,
  LogItemExtraInput,
  LogLevel,
} from "@aws-lambda-powertools/logger/types";

interface ExtraOptions {
  noLog?: string;
  env?: string;
}

export class Logger extends LoggerLibrary {
  private logBuffer: { message: LogItemMessage; data: LogItemExtraInput }[] =
    [];

  private debugLogger: LoggerLibrary;

  constructor(opts: ConstructorOptions & ExtraOptions) {
    super(opts);

    if (opts.noLog) {
      this.error = this.pass;
      this.warn = this.pass;
      this.info = this.pass;
      this.debug = this.pass;
    } else if (opts.env === "DEV") {
      // eslint-disable-next-line no-console
      this.error = console.log;
      // eslint-disable-next-line no-console
      this.warn = console.log;
      // eslint-disable-next-line no-console
      this.info = console.log;
      // eslint-disable-next-line no-console
      this.debug = console.log;
    } else if (opts.logLevel !== "DEBUG") {
      this.debugLogger = new LoggerLibrary({
        serviceName: opts.serviceName,
        logLevel: "DEBUG",
      });
      this.debug = this.buffer;
    }
  }

  private pass() {}

  private buffer(message: LogItemMessage, ...data: LogItemExtraInput) {
    this.logBuffer.push({ message, data });
  }

  flush() {
    this.logBuffer.forEach(({ message, data }) => {
      this.debugLogger.debug(message, ...data);
    });
    this.clear();
  }

  clear() {
    this.logBuffer = [];
  }
}

export const logger = new Logger({
  serviceName: process.env.AWS_LAMBDA_FUNCTION_NAME,
  logLevel: (process.env.LOG_LEVEL as LogLevel) ?? "INFO",
  noLog: process.env.CODEBUILD_BUILD_ID,
  env: process.env.NODE_ENV,
});
