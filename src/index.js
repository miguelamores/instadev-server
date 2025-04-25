import express from "express";
import { initializeDatabase } from "./database.js";
import dotenv from "dotenv";
import { fetchAndSaveAccounts } from "./collections/accountService.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Use JSON middleware
app.use(express.json());

// Define database ID from environment variables
const databaseId = process.env.APPWRITE_DATABASE_ID;

// Initialize the database when the server starts
(async () => {
  try {
    if (!databaseId) {
      console.error("APPWRITE_DATABASE_ID environment variable is not set");
      process.exit(1);
    }

    console.log("Initializing database...");
    await initializeDatabase(databaseId);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
})();

// Define a simple endpoint
app.get("/", (req, res) => {
  res.send("InstaClone API Server");
});

// Endpoint to fetch and save accounts from Appwrite to our database
app.get("/accounts/sync", async (req, res) => {
  try {
    const savedAccounts = await fetchAndSaveAccounts(databaseId);
    res.json({
      success: true,
      message: `Successfully processed ${savedAccounts.length} accounts`,
      data: savedAccounts,
    });
  } catch (error) {
    console.error("Error syncing accounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync accounts",
      error: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
