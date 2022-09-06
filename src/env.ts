export class Environment {
    public readonly devMode: boolean = process.env.NODE_ENV === "development";

    public readonly port: number = Number(process.env.PORT ?? 80);

    public readonly dbHost: string = process.env.DATABASE_HOST ?? "localhost";

    public readonly dbUser: string = process.env.DATABASE_USER ?? "root";

    public readonly dbPassword: string = process.env.DATABASE_PASSWORD ?? "qwerty123";

    public readonly dbBase: string = process.env.DATABASE_BASE ?? "kinopoisk";
}