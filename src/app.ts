import express, {Express} from "express";
import bodyParser from "body-parser";
import {Connection, createConnection} from "mysql2/promise";
import Ajv from "ajv";
import {Environment} from "@env";
import {Logger} from "@logger";
import {createRouters} from "./routers";

export interface AppContext {
    app: Express;
    dbConn: Connection;
    ajv: Ajv;
    env: Environment;
    logger: Logger;
}

export interface AppListenOptions {
    env?: Environment;
    logger?: Logger;
    ajv?: Ajv;
}

export class App {
    public static async listen(options: AppListenOptions = {}): Promise<[App, Express]> {
        const app = new App;
        const expressApp: Express = await app.listen(options);
        return [app, expressApp];
    }

    public connectDb(env: Environment): Promise<Connection> {
        return createConnection({
            host: env.dbHost,
            user: env.dbUser,
            password: env.dbPassword,
            database: env.dbBase
        });
    }

    public async listen({env = new Environment, logger = new Logger, ajv = new Ajv}: AppListenOptions = {}): Promise<Express> {
        const dbConn: Connection = await this.connectDb(env);
        const app: Express = express();
        const ctx: AppContext = {app, dbConn, ajv, env, logger};
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(createRouters(ctx));
        app.listen(env.port);
        logger.log("Server is listening on http://localhost:" + env.port + "/");
        return app;
    }
}