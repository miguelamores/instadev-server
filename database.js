import {
  Databases,
  ID,
  Query,
  RelationMutate,
  RelationshipType,
} from "node-appwrite";
import client from "./setup.js";

// Initialize the Databases service
const databases = new Databases(client);

/**
 * Creates the users collection with the specified attributes
 * @param {string} databaseId - The database ID where the collection will be created
 * @returns {Promise} - The created collection
 */
export async function createUsersCollection(databaseId) {
  try {
    // First, check if the collection already exists to avoid duplicates
    const collections = await databases.listCollections(databaseId);
    const usersCollection = collections.collections.find(
      (collection) => collection.name === "users"
    );

    const postsCollection = collections.collections.find(
      (collection) => collection.name === "posts"
    );

    if (usersCollection) {
      console.log("Users collection already exists");
      return usersCollection;
    }

    // Create the users collection
    const collection = await databases.createCollection(
      databaseId,
      ID.unique(),
      "users",
      [
        // You can add permissions here if needed
        // Example: 'read("any")', 'write("team:developers")'
      ]
    );

    console.log("Created users collection:", collection.$id);

    // Create attributes for the collection
    await Promise.all([
      // id attribute is automatically created

      // name attribute
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "name",
        255, // max length
        true // required
      ),

      // username attribute
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "username",
        100, // max length
        true // required
      ),

      // email attribute
      databases.createEmailAttribute(
        databaseId,
        collection.$id,
        "email",
        true // required
      ),

      // imageUrl attribute
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "imageUrl",
        1024, // max length
        true // required
      ),

      // imageId attribute (with default null)
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "imageId",
        255, // max length
        false, // not required
        null // default value
      ),

      // bio attribute (nullable)
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "bio",
        1024, // max length
        false, // not required
        null // default value
      ),

      // accountId attribute
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "accountId",
        255, // max length
        true // required
      ),
    ]);

    // Wait a bit for the attributes to be created
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add relationship attribute (this will need a posts collection to be created separately)
    // Adding after initial attribute creation to avoid potential race conditions
    await databases.createRelationshipAttribute(
      databaseId,
      collection.$id,
      postsCollection.$id, // the related collection ID or name where posts would be stored
      RelationshipType.ManyToOne, // type of relationship - user can have many posts
      true, // Two-way relationship
      "creator",
      "posts",
      RelationMutate.Cascade // what happens when the related document is deleted
    );

    console.log("Created relationship attribute for users collection");

    // Create indexes for faster queries
    await Promise.all([
      // Index on email for quick lookups
      databases.createIndex(databaseId, collection.$id, "email_index", "key", [
        "email",
      ]),

      // Index on username for quick lookups
      databases.createIndex(
        databaseId,
        collection.$id,
        "username_index",
        "key",
        ["username"]
      ),

      // Index on accountId for quick lookups
      databases.createIndex(
        databaseId,
        collection.$id,
        "account_index",
        "key",
        ["accountId"]
      ),
    ]);

    console.log("Created all attributes and indexes for users collection");
    return collection;
  } catch (error) {
    console.error("Error creating users collection:", error);
    throw error;
  }
}

/**
 * Initialize the database by creating all necessary collections
 * @param {string} databaseId - The database ID to use
 */
export async function initializeDatabase(databaseId) {
  try {
    await createUsersCollection(databaseId);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
