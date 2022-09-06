import "module-alias/register";
import "dotenv/config";
import {App} from "@app";

(async () => {
    const app = new App;
    await app.listen();
})();