import {Router} from "express";
import {RowDataPacket} from "mysql2";
import {JSONSchemaType, ValidateFunction} from "ajv";
import {AppContext} from "@app";
import {MovieActorRow, MovieRow} from "../movies";

export interface ActorRow extends RowDataPacket {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    "year-birth": number;
    gender: number;
}

export function createActorsRouter(ctx: AppContext): Router {
    const {ajv, dbConn} = ctx;
    const router = Router();
    (() => {
        interface Body {
            name: string;
            surname: string;
            patronymic: string;
            "year-birth": number;
            gender: number;
        }
        const bodySchema: JSONSchemaType<Body> = {
            type: "object",
            properties: {
                name: {type: "string"},
                surname: {type: "string"},
                patronymic: {type: "string"},
                "year-birth": {type: "integer"},
                gender: {type: "integer"}
            },
            required: [
                "name",
                "surname",
                "patronymic",
                "year-birth",
                "gender"
            ]
        };
        const validateBody: ValidateFunction = ajv.compile(bodySchema);
        router.post("/", async (req, res) => {
            const body: Body = {
                name: req.body["name"],
                surname: req.body["surname"],
                patronymic: req.body["patronymic"],
                "year-birth": Number(req.body["year-birth"]),
                gender: Number(req.body["gender"])
            };
            if(!validateBody(body) && validateBody.errors)
                return res.send({
                    errors: validateBody.errors.map((error) => error.message)
                });
            const {name, surname, patronymic, "year-birth": yearBirth, gender} = body;
            if(name === "")
                return res.send({
                    errors: ["Enter name"]
                });
            if(surname === "")
                return res.send({
                    errors: ["Enter surname"]
                });
            if(patronymic === "")
                return res.send({
                    errors: ["Enter patronymic"]
                });
            if(yearBirth === 0)
                return res.send({
                    errors: ["Enter year birth"]
                });
            if(gender === 0)
                return res.send({
                    errors: ["Enter gender"]
                });
            await dbConn.query("INSERT INTO `actors` (`name`, `surname`, `patronymic`, `year-birth`, `gender`) VALUES (?, ?, ?, ?, ?);", [name, surname, patronymic, yearBirth, gender]);
            return res.send({
                errors: null
            });
        });
    })();
    (() => {
        interface Body {
            name: string | null;
            surname: string | null;
            patronymic: string | null;
            "year-birth": number | null;
            gender: number | null;
        }
        const bodySchema: JSONSchemaType<Body> = {
            type: "object",
            properties: {
                name: {type: "string", nullable: true},
                surname: {type: "string", nullable: true},
                patronymic: {type: "string", nullable: true},
                "year-birth": {type: "integer", nullable: true},
                gender: {type: "integer", nullable: true}
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
                surname: req.body["surname"] ?? null,
                patronymic: req.body["patronymic"] ?? null,
                "year-birth": Number(req.body["year-birth"]),
                gender: Number(req.body["gender"])
            };
            if(Number.isNaN(body["year-birth"]))
                body["year-birth"] = null;
            if(Number.isNaN(body.gender))
                body.gender = null;
            if(!validateBody(body) && validateBody.errors)
                return res.send({
                    errors: validateBody.errors.map((error) => error.message)
                });
            const {name, surname, patronymic, "year-birth": yearBirth, gender} = body;
            let dbQuery: string = "UPDATE `actors` SET ";
            const updateList: Map<string, string | number> = new Map;
            if(name)
                updateList.set("name", name);
            if(surname)
                updateList.set("surname", surname);
            if(patronymic)
                updateList.set("patronymic", patronymic);
            if(yearBirth)
                updateList.set("year-birth", yearBirth);
            if(gender)
                updateList.set("gender", gender);
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
        await dbConn.query("DELETE FROM `actors` WHERE `id` = ?;", id);
        return res.send("1");
    });
    router.get("/:id/movies", async (req, res) => {
        const id: number = Number(req.params.id);
        if(Number.isNaN(id))
            return res.send([]);
        const [movieActorRows] = await dbConn.query<MovieActorRow[]>("SELECT * FROM `movies-actors` WHERE `actor-id` = ? LIMIT 10;", id);
        const movies: MovieRow[] = [];
        for(const row of movieActorRows) {
            const [[movie = null]] = await dbConn.query<MovieRow[]>("SELECT * FROM `movies` WHERE `id` = ?;", row["movie-id"]);
            if(movie === null)
                continue;
            movies.push(movie);
        }
        return res.send(movies);
    });
    return router;
}