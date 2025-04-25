import { Databases, ID, Query, Users } from "node-appwrite";
import client from "../../setup.js";

// Initialize the Databases service and Users service
const databases = new Databases(client);
const users = new Users(client); // Use Users API for server operations

/**
 * Fetches accounts from Appwrite and saves them to the database
 * @param {string} databaseId - The database ID where accounts will be saved
 * @returns {Promise<Array>} - The saved accounts
 */
export async function fetchAndSaveAccounts(databaseId) {
  try {
    console.log("Fetching accounts...");

    // First, get all collections to find the users collection
    const collections = await databases.listCollections(databaseId);
    const usersCollection = collections.collections.find(
      (collection) => collection.name === "users"
    );

    if (!usersCollection) {
      throw new Error("Users collection not found");
    }

    // Get all accounts from Appwrite using the Users API with pagination
    let allUsers = [];
    let offset = 0;
    const limit = 100; // Maximum allowed by Appwrite
    let hasMoreUsers = true;

    while (hasMoreUsers) {
      // Create queries for pagination
      const queries = [Query.limit(limit), Query.offset(offset)];

      const accountsPage = await users.list(queries);
      allUsers = [...allUsers, ...accountsPage.users];

      // Check if we should fetch more users
      if (accountsPage.users.length < limit) {
        hasMoreUsers = false;
      } else {
        offset += limit;
      }
    }

    console.log(`Found ${allUsers.length} accounts in total`);

    // For each account, check if it already exists in the database
    // If not, create a new user document
    const savedAccounts = [];

    for (const acc of allUsers) {
      try {
        // Check if user already exists with this accountId
        const existingUsers = await databases.listDocuments(
          databaseId,
          usersCollection.$id,
          [Query.equal("accountId", acc.$id)]
        );

        if (existingUsers.total > 0) {
          console.log(`Account ${acc.$id} already exists in database`);
          savedAccounts.push(existingUsers.documents[0]);
          continue;
        }

        // Create a new user document
        const userData = {
          name: acc.name || "User",
          username: acc.name
            ? acc.name.toLowerCase().replace(/\s+/g, "_")
            : `user_${acc.$id.substring(0, 8)}`,
          email: acc.email,
          imageUrl:
            acc.prefs?.avatar ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=" + acc.$id,
          bio: acc.prefs?.bio || null,
          accountId: acc.$id,
        };

        const newUser = await databases.createDocument(
          databaseId,
          usersCollection.$id,
          ID.unique(),
          userData
        );

        console.log(`Created new user document for account ${acc.$id}`);
        savedAccounts.push(newUser);
      } catch (error) {
        console.error(`Error processing account ${acc.$id}:`, error);
      }
    }

    console.log(`Successfully processed ${savedAccounts.length} accounts`);
    return savedAccounts;
  } catch (error) {
    console.error("Error fetching and saving accounts:", error);
    throw error;
  }
}
