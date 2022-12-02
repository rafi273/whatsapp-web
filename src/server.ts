import errorHandler from "errorhandler";
import http from "http";
import socket from "socket.io";
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
const server = app.listen(app.get("port"), () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
});
const io = new socket.Server(http.createServer(app));

io.on("connection", function(socket) {
    socket.emit("message", "Connecting..."); 
});
client.initialize();

export default server;
