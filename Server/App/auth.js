import dotenv from "dotenv";
const ALLOWED_KEY = process.env.ALLOWED_API_KEY;

const isValidApiKey = (apiKey) => {
  // Check if the apiKey is valid
  return apiKey === ALLOWED_KEY;
};

const authenticateRequest = (req, res, next) => {
  const apiKey = req.headers.authorization; // Get the apiKey from the request headers
  if (!apiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // Validate the apiKey against your whitelist or other criteria
  if (isValidApiKey(apiKey)) {
    next(); // Proceed to the next middleware/route
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default authenticateRequest;

//in the front end, remember to add the API key
