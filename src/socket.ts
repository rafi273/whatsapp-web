import qrcode from "qrcode";
import ws from "ws";
import { Client, LocalAuth } from "whatsapp-web.js";
import * as Sentry from "@sentry/node";
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
const io = new ws.WebSocketServer({
    port: parseInt(process.env.REDIS_PORT) || 3001
});

Sentry.init({ dsn: "https://02b54883ded741a89eb25c8769343f13@o971121.ingest.sentry.io/4504268372574208" });
client.initialize();

io.on("connection", function(socket) {
    socket.send(template(MESSAGE, "Connecting...")); 

    client.on("qr", (qr) => {
        qrcode.toDataURL(qr, (err, url) => {
            socket.send(template(QR, url));
            socket.send(template(MESSAGE, "QR Code received, scan please!"));
        });
    });

    client.on("ready", () => {
        socket.send(template(READY, "Whatsapp is ready!"));
        socket.send(template(MESSAGE, "Whatsapp is ready!"));
    });
    
    client.on("authenticated", () => {
        socket.send(template(AUTHENTICATED, "Whatsapp is authenticated!"));
        socket.send(template(MESSAGE, "Whatsapp is authenticated!"));
    });

    client.on("auth_failure", () => {
        socket.send(template(MESSAGE, "Auth failure, restarting..."));
    });

    client.on("disconnected", () => {
        socket.send(template(MESSAGE, "Whatsapp is disconnected!"));
        client.destroy();
        client.initialize();
    });
});

const AUTHENTICATED = "authenticated";
const MESSAGE = "message";
const READY = "ready";
const QR = "qr";

function template(event: string, message: string) {
    return JSON.stringify({
        event: event,
        payload: message
    });
}

client.on("message", message => {
    try {
        bot(client, message);
    } catch (error) {
        Sentry.captureException(error);
    }
});

export default client;
