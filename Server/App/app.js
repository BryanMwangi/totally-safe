import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { logger, logBlockedIps } from "../Logs/logs.js";
import authenticateRequest from "./auth.js";
import { generateKey, getSavedKey } from "../Crypto/crypto.js";
import { sendMass } from "../Emails/emails.js";

const app = express();

// Set of blocked IPs
const blockedIPs = new Set();
// Middleware to check and block requests from banned IPs
const blockIPs = (req, res, next) => {
  const clientIP = req.ip;

  if (blockedIPs.has(clientIP)) {
    res.status(403).json({ error: "Access forbidden" });
  } else {
    next();
  }
};

const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: false, // disable `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  requestWasSuccessful: (req, res) => res.statusCode < 400,
  keyGenerator: (req, res) => req.ip,
  handler: (request, response, options) => {
    if (request.rateLimit.used === request.rateLimit.limit + 1) {
      const clientIpHeader = req.headers["x-forwarded-for"];
      blockedIPs.add(clientIpHeader || request.ip);
      logBlockedIps(clientIpHeader || request.ip);
    }
    response.status(429).json({ error: "Too many requests, try again later" });
  },
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "DELETE", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  helmet({
    frameguard: { action: "deny" }, // X-Frame-Options: DENY
    xssFilter: true, // X-XSS-Protection: 1; mode=block
    noSniff: true, // X-Content-Type-Options: nosniff
  })
);
app.disable("x-powered-by");
app.use(limiter);
app.use(blockIPs);
app.use(authenticateRequest);

app.get("/generator/key", async (req, res) => {
  //check whether the requester is genuine||middleware will check for this
  //we now get the key
  try {
    const { key, keyId } = await generateKey();
    //we return the key to the client
    // logger.info(`Key generated for key id ${keyId}`);
    return res.status(200).json({ key: key, keyId: keyId });
  } catch (err) {
    logger.error(`Error generating key: ${err}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/generator/previousKey/:keyId", async (req, res) => {
  try {
    const keyId = req.params.keyId;
    const key = await getSavedKey(keyId);
    if (!key) {
      return res.status(404).json({ error: "Key not found" });
    }
    return res.status(200).json({ key: key });
  } catch (error) {
    logger.error(`Error getting previously generated key: ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/sendEmailTo", async (req, res) => {
  try {
    const emailData = req.body;
    const emails = emailData.emails;
    const count = emailData.count;
    if (emails.length > 0) {
      const { error, message } = await sendMass(count, emails);
      if (error != null) {
        logger.error(`Error sending email: ${error}`);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      logger.info(`Email sent successfully: ${message}`);
      return res.status(200).json({ message: "Email sent successfully" });
    }
    return res.status(400).json({ error: "No emails provided" });
  } catch (err) {
    logger.error(`Error sending email: ${err}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/encryptionFailed/:keyId", (req, res) => {
  try {
    const keyId = req.params.keyId;
    logger.error(`encryption task failed for key id`);
    return res.status(200).end();
  } catch (error) {
    logger.error(`Error logging encryption task failure: ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/encryptionSuccess/:keyId", (req, res) => {
  try {
    const keyId = req.params.keyId;
    logger.info(`Encryption task successful for key id `);
    return res.status(200).end();
  } catch (error) {
    logger.error(`Error logging encryption task failure: ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
