import {Router} from "express";
import {RowDataPacket} from "mysql2";
import {JSONSchemaType, ValidateFunction} from "ajv";
import {AppContext} from "@app";
import {ActorRow} from "../actors";

export interface MovieRow extends RowDataPacket {
    id: number;
    name: string;
    genre: string;
    desc: string;
    "year-release": number;
}

export interface MovieCountRow extends RowDataPacket {
    "COUNT(*)": number;
}

export interface Movie extends MovieRow {
    actors: ActorRow[];
}

export interface MovieActorRow extends RowDataPacket {
    "movie-id": number;
    "actor-id": number;
}

export function createMoviesRouter(ctx: AppContext): Router {
    const {dbConn, ajv} = ctx; 
    const router = Router();
    (() => {
        interface Query {
            offset: number;
            limit: number;
            page: number;
            filter: string | null;
        }
        const querySchema: JSONSchemaType<Query> = {
            type: "object",
            properties: {
                offset: {type: "integer"},
                limit: {type: "integer", minimum: 1, maximum: 50},
                page: {type: "integer"},
                filter: {type: "string", nullable: true}
            },
            required: []
        }; 
        const validateQuery: ValidateFunction = ajv.compile(querySchema);
        router.get("/", async (req, res) => {
            const query: Query = {
                offset: Number(req.query["offset"] ?? 0),
                limit: Number(req.query["limit"] ?? 30),
                page: Number(req.query["page"] ?? 0),
                filter: req.query["filter"]?.toString() ?? null
            };
            if(query.page !== 0)
                query.offset = (query.page - 1) * query.limit;
            if(!validateQuery(query) && validateQuery.errors)
                return res.send({
                    errors: validateQuery.errors.map((error) => error.message)
                });
            let dbQuery: string = "SELECT `id`, `name`, `genre`, `year-release` FROM `movies`";
            if(query.filter) {
                dbQuery += " ORDER BY ";
                const filterSplitted: string[] = query.filter.split(",").filter((by) => by === "name" || by === "genre" || by === "year-release");
                for(let index = 0; index < filterSplitted.length; index++) {
                    const by: string = filterSplitted[index];
                    dbQuery += " `" + by.replace(/`/g, "") + "` ASC";
                    if(index + 1 !== filterSplitted.length)
                        dbQuery += ", ";
                }
            }
            dbQuery += " LIMIT " + query.offset + ", " + query.limit + ";";
            const [movies] = await dbConn.query<MovieRow[]>(dbQuery);
            return res.send(movies);
        });
    })();
    router.get("/count", async (req, res) => {
        const [[{"COUNT(*)": count}]] = await dbConn.query<MovieCountRow[]>("SELECT COUNT(*) FROM `movies`;");
        return res.send(count.toString());
    });
    router.get("/:id", async (req, res) => {
        const id = Number(req.params["id"]);
        if(Number.isNaN(id))
            return res.sendStatus(404);
        const [[movieRow = null]] = await dbConn.query<MovieRow[]>("SELECT * FROM `movies` WHERE `id` = ?;", id);
        if(movieRow === null)
            return res.sendStatus(404);
        const movie: Movie = {
            ...movieRow,
            actors: []   
        };
        const [movieActorRows] = await dbConn.query<MovieActorRow[]>("SELECT * FROM `movies-actors` WHERE `movie-id` = ?;", id);
        for(const row of movieActorRows) {
            const [[actorRow = null]] = await dbConn.query<ActorRow[]>("SELECT * FROM `actors` WHERE `id` = ?;", row["actor-id"]);
            if(actorRow === null)
                continue;
            movie.actors.push(actorRow);
        }
        return res.send(movie);
    });
    (() => {
        interface Body {
            name: string;
            desc: string;
            genre: string;
            "year-release": number;
        }
        const bodySchema: JSONSchemaType<Body> = {
            type: "object",
            properties: {
                name: {type: "string"},
                desc: {type: "string"},
                genre: {type: "string"},
                "year-release": {type: "integer"}
            },
            required: [
                "name",
                "desc",
                "genre",
                "year-release"
            ]
        };
        const validateBody: ValidateFunction = ajv.compile(bodySchema);
        router.post("/", async (req, res) => {
            const body: Body = {
                name: req.body["name"],
                desc: req.body["desc"],
                genre: req.body["genre"],
                "year-release": Number(req.body["year-release"])
            };
            if(!validateBody(body) && validateBody.errors)
                return res.send({
                    errors: validateBody.errors.map((error) => error.message)
                });
            const {name, desc, genre, "year-release": yearRelease} = body;
            if(name === "")
                return res.send({
                    errors: ["Enter name"]
                });
            if(desc === "")
                return res.send({
                    errors: ["Enter description"]
                });
            if(genre === "")
                return res.send({
                    errors: ["Enter genre"]
                });
            if(yearRelease === 0)
                return res.send({
                    errors: ["Enter year release"]
                });
            await dbConn.query("INSERT INTO `movies` (`name`, `desc`, `genre`, `year-release`) VALUES (?, ?, ?, ?);", [name, desc, genre, yearRelease]);
            return res.send({
                errors: null
            });
        });
    })();
    (() => {
        interface Body {
            id: number;
        }
        const bodySchema: JSONSchemaType<Body> = {
            type: "object",
            properties: {
                id: {type: "integer"}
            },
            required: [
                "id"
            ]
        };
        const validateBody: ValidateFunction = ajv.compile(bodySchema);
        router.post("/:id/attach-actor", async (req, res) => {
            const id: number = Number(req.params.id);
            if(Number.isNaN(id))
                return res.send({
                    errors: null
                });
            const body: Body = {
                id: Number(req.body.id)
            };
            if(!validateBody(body) && validateBody.errors)
                return res.send({
                    errors: validateBody.errors.map((error) => error.message)
                });
            const {id: actorId} = body;
            try {
                await dbConn.query("INSERT INTO `movies-actors` (`movie-id`, `actor-id`) VALUES (?, ?);", [id, actorId]);
            } catch(error) {
                if(error instanceof Error)
                    return res.send({
                        errors: [error.message]
                    });
            }
            return res.send({
                errors: null
            });
        });
    })();
    (() => {
        interface Body {
            name: string | null;
            desc: string | null;
            genre: string | null;
            "year-release": number | null;
        }
        const bodySchema: JSONSchemaType<Body> = {
            type: "object",
            properties: {
                name: {type: "string", nullable: true},
                desc: {type: "string", nullable: true},
                genre: {type: "string", nullable: true},
                "year-release": {type: "integer", nullable: true}
            },
            required: []
        };
        const validateBody: ValidateFunction = ajv.compile(bodySchema);
        router.put("/:id", async (req, res) => {
            const id: number = Number(req.params.id);
            if(Number.isNaN(id))
                return res.sendStatus(404);
            const body: Body = {
                name: req.body["name"] ?? null,
                desc: req.body["desc"] ?? null,
                genre: req.body["genre"] ?? null,
                "year-release": Number(req.body["year-release"])
            };
            if(Number.isNaN(body["year-release"]))
                body["year-release"] = null;
            if(!validateBody(body) && validateBody.errors)
                return res.send({
                    errors: validateBody.errors.map((error) => error.message)
                });
            const {name, desc, genre, "year-release": yearRelease} = body;
            let dbQuery: string = "UPDATE `movies` SET ";
            const updateList: Map<string, string | number> = new Map;
            if(name)
                updateList.set("name", name);
            if(desc)
                updateList.set("desc", desc);
            if(genre)
                updateList.set("genre", genre);
            if(yearRelease)
                updateList.set("year-release", yearRelease);
            if(updateList.size === 0)
                return res.send({
                    errors: null
                });
            let index = 0;
            for(const [key, value] of updateList) {
                dbQuery += "`" + key + "` = " + (typeof value === "string" ? JSON.stringify(value) : value);
                if(index + 1 !== updateList.size)
                    dbQuery += ", ";
                index++;
            }
            dbQuery += " WHERE `id` = ?;";
            await dbConn.query(dbQuery, id);
            return res.send({
                errors: null
            });
        });
    })();
    router.delete("/:id", async (req, res) => {
        const id: number = Number(req.params.id);
        if(Number.isNaN(id))
            return res.send("0");
        await dbConn.query("DELETE FROM `movies` WHERE `id` = ?;", id);
        return res.send("1");
    });
    return router;
}