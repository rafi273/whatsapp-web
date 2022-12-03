import { Client, LocalAuth } from "whatsapp-web.js";
import qrcodeTerminal from "qrcode-terminal";
import qrcode from "qrcode";
import ws from "ws";
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
    port: 3001
});

client.initialize();

io.on("connection", function(socket) {
    socket.send(template(notification, "Connecting...")); 

    client.on("qr", (qr) => {
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit("qr", url);
            socket.emit("message", "QR Code received, scan please!");
        });
    });

    client.on("ready", () => {
        socket.emit("ready", "Whatsapp is ready!");
        socket.emit("message", "Whatsapp is ready!");
    });
    
    client.on("authenticated", () => {
        socket.emit("authenticated", "Whatsapp is authenticated!");
        socket.emit("message", "Whatsapp is authenticated!");
    });

    client.on("auth_failure", () => {
        socket.emit("message", "Auth failure, restarting...");
    });

    client.on("disconnected", () => {
        socket.emit("message", "Whatsapp is disconnected!");
        client.destroy();
        client.initialize();
    });
});

const notification = "notification";

function template(event: string, message: string) {
    return JSON.stringify({
        event: event,
        payload: message
    });
}

client.on("loading_screen", (percent, message) => {
    console.log("LOADING SCREEN", percent, message);
});

client.on("message", message => {
    bot(client, message);
});

export default client;
