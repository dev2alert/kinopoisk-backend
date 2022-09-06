import {Router} from "express";
import {AppContext} from "@app";
import {createMoviesRouter} from "./movies";
import {createActorsRouter} from "./actors";

export function createRouters(ctx: AppContext): Router {
    const router = Router();
    router.use("/movies", createMoviesRouter(ctx));
    router.use("/actors", createActorsRouter(ctx));
    return router;
}