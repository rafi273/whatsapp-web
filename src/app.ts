import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import "dotenv/config";

// Controllers (route handlers)
// import broadcastController from "./controllers/broadcast";
// import webhookController from "./controllers/webhook";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.disable("x-powered-by");

/**
 * Primary app routes.
 */
// app.post("/broadcast", getKartiniSignature, broadcastController);
// app.post("/webhook", getParameterAndCheck, webhookController);

export default app;
