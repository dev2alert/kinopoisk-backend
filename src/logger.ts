import chalk from "chalk";

export class Logger {
    public log(content: string): void {
        console.log(chalk.blue.bold("[Kinopoisk]"), content);
    }
}