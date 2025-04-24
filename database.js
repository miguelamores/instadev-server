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
      RelationMutate.SetNull // what happens when the related document is deleted
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
 * Creates the posts collection with the specified attributes
 * @param {string} databaseId - The database ID where the collection will be created
 * @returns {Promise} - The created collection
 */
export async function createPostsCollection(databaseId) {
  try {
    // First, check if the collection already exists to avoid duplicates
    const collections = await databases.listCollections(databaseId);
    const postsCollection = collections.collections.find(
      (collection) => collection.name === "posts"
    );

    const usersCollection = collections.collections.find(
      (collection) => collection.name === "users"
    );

    if (postsCollection) {
      console.log("Posts collection already exists");
      return postsCollection;
    }

    // Create the posts collection
    const collection = await databases.createCollection(
      databaseId,
      ID.unique(),
      "posts",
      [
        // You can add permissions here if needed
        // Example: 'read("any")', 'write("team:developers")'
      ]
    );

    console.log("Created posts collection:", collection.$id);

    // Create attributes for the collection
    await Promise.all([
      // content attribute
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "content",
        2048, // max length
        true // required
      ),

      // tags attribute - for array of strings
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "tags",
        255, // max length per tag
        false, // not required
        null, // default value
        true // is array
      ),

      // imageUrl attribute
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "imageUrl",
        1024, // max length
        true // required
      ),

      // imageId attribute
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "imageId",
        255, // max length
        true // required
      ),

      // location attribute
      databases.createStringAttribute(
        databaseId,
        collection.$id,
        "location",
        255, // max length
        false, // not required
        null // default value
      ),
    ]);

    // Wait a bit for the attributes to be created
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add relationship attribute (linking posts to users)
    await databases.createRelationshipAttribute(
      databaseId,
      collection.$id,
      usersCollection.$id, // the related collection ID or name where users are stored
      RelationshipType.ManyToOne, // type of relationship - many posts can belong to one user
      true, // Two-way relationship
      "user",
      "posts",
      RelationMutate.SetNull // delete posts when user is deleted
    );

    console.log("Created relationship attribute for posts collection");

    // Create indexes for faster queries
    await Promise.all([
      // Index on tags for quick lookups
      databases.createIndex(databaseId, collection.$id, "tags_index", "key", [
        "tags",
      ]),
    ]);

    console.log("Created all attributes and indexes for posts collection");
    return collection;
  } catch (error) {
    console.error("Error creating posts collection:", error);
    throw error;
  }
}

/**
 * Creates the saves collection with relationships to users and posts
 * @param {string} databaseId - The database ID where the collection will be created
 * @returns {Promise} - The created collection
 */
export async function createSavesCollection(databaseId) {
  try {
    // First, check if the collection already exists to avoid duplicates
    const collections = await databases.listCollections(databaseId);
    const savesCollection = collections.collections.find(
      (collection) => collection.name === "saves"
    );

    const usersCollection = collections.collections.find(
      (collection) => collection.name === "users"
    );

    const postsCollection = collections.collections.find(
      (collection) => collection.name === "posts"
    );

    if (savesCollection) {
      console.log("Saves collection already exists");
      return savesCollection;
    }

    // Create the saves collection
    const collection = await databases.createCollection(
      databaseId,
      ID.unique(),
      "saves",
      [
        // You can add permissions here if needed
        // Example: 'read("any")', 'write("team:developers")'
      ]
    );

    console.log("Created saves collection:", collection.$id);

    // Wait a bit for the collection to be created
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add relationship attribute - link to users
    await databases.createRelationshipAttribute(
      databaseId,
      collection.$id,
      usersCollection.$id,
      RelationshipType.ManyToOne, // Many saves can belong to one user
      true, // Two-way relationship
      "user",
      "save", // User's saved posts
      RelationMutate.SetNull // Delete saves when user is deleted
    );

    console.log("Created user relationship attribute for saves collection");

    // Wait a bit for the first relationship to be created
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add relationship attribute - link to posts
    await databases.createRelationshipAttribute(
      databaseId,
      collection.$id,
      postsCollection.$id,
      RelationshipType.ManyToOne, // Many saves can reference one post
      true, // Two-way relationship
      "post",
      "save", // Users who saved this post
      RelationMutate.SetNull // Delete saves when post is deleted
    );

    console.log("Created post relationship attribute for saves collection");

    // Create a composite index on user and post for faster lookups and uniqueness
    await databases.createIndex(
      databaseId,
      collection.$id,
      "user_post_index",
      "key",
      ["user", "post"]
    );

    console.log("Created index for saves collection");
    return collection;
  } catch (error) {
    console.error("Error creating saves collection:", error);
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
    await createPostsCollection(databaseId);
    await createSavesCollection(databaseId);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
