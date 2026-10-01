import ServerlessHttp from "serverless-http";
import app from "./app";

export const handler = ServerlessHttp(app);
