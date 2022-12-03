import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import "dotenv/config";

// Controllers (route handlers)
import { bot } from "./controllers/bot";


const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--no-first-run",
            "--no-zygote"
        ]
    },
    authStrategy: new LocalAuth()
});

client.on("loading_screen", (percent, message) => {
    console.log("LOADING SCREEN", percent, message);
});

client.on("qr", (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log("QR RECEIVED", qr);
    qrcode.generate(qr, {small: true});
});

client.on("auth_failure", message => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", message);
});

client.on("ready", () => {
    console.log("Client is ready!");
});

client.on("message", message => {
    bot(client, message);
});

client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
});

export default client;
