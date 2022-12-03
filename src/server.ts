import errorHandler from "errorhandler";
import http from "http";
import socketIo from "socket.io";
import app from "./app";
import client from "./socket";
import "dotenv/config";


/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
    app.use(errorHandler());
}


/**
 * Start Express server.
 */
const serv = http.createServer(app);
const io = socketIo(serv);

client.initialize();
io.on("connection", function(socket) {
    console.log("Connecting...");
    socket.emit("message", "Connecting..."); 
});

const server = app.listen(app.get("port"), () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
});

export default server;
