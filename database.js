import {
  Databases,
  ID,
  IndexType,
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

    // Create indexes for faster queries
    await Promise.all([
      // Index on email for quick lookups
      databases.createIndex(
        databaseId,
        collection.$id,
        "email_index",
        IndexType.Key,
        ["email"]
      ),

      // Index on username for quick lookups
      databases.createIndex(
        databaseId,
        collection.$id,
        "username_index",
        IndexType.Key,
        ["username"]
      ),

      // Index on accountId for quick lookups
      databases.createIndex(
        databaseId,
        collection.$id,
        "account_index",
        IndexType.Key,
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

    // Create indexes for faster queries
    await Promise.all([
      // Index on tags for quick lookups
      databases.createIndex(
        databaseId,
        collection.$id,
        "tags_index",
        IndexType.Key,
        ["tags"]
      ),
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

    // Create a composite index on user and post for faster lookups and uniqueness
    // await databases.createIndex(
    //   databaseId,
    //   collection.$id,
    //   "user_post_index",
    //   IndexType.Key,
    //   ["user", "post"]
    // );

    console.log("Created index for saves collection");
    return collection;
  } catch (error) {
    console.error("Error creating saves collection:", error);
    throw error;
  }
}

/**
 * Creates the likes collection with relationships to users and posts
 * @param {string} databaseId - The database ID where the collection will be created
 * @returns {Promise} - The created collection
 */
export async function createLikesCollection(databaseId) {
  try {
    // First, check if the collection already exists to avoid duplicates
    const collections = await databases.listCollections(databaseId);
    const likesCollection = collections.collections.find(
      (collection) => collection.name === "likes"
    );

    if (likesCollection) {
      console.log("Likes collection already exists");
      return likesCollection;
    }

    // Create the likes collection
    const collection = await databases.createCollection(
      databaseId,
      ID.unique(),
      "likes",
      [
        // You can add permissions here if needed
        // Example: 'read("any")', 'write("team:developers")'
      ]
    );

    console.log("Created likes collection:", collection.$id);

    // Wait a bit for the collection to be created
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a composite index on user and post for faster lookups and uniqueness
    // await databases.createIndex(
    //   databaseId,
    //   collection.$id,
    //   "user_post_index",
    //   IndexType.Key,
    //   ["user", "post"]
    // );

    console.log("Created index for likes collection");
    return collection;
  } catch (error) {
    console.error("Error creating likes collection:", error);
    throw error;
  }
}

/**
 * Creates relationships between collections after all collections are created
 * @param {string} databaseId - The database ID where the collections exist
 */
export async function createRelationships(databaseId) {
  try {
    console.log("Creating relationships between collections...");

    // Get all collections
    const collections = await databases.listCollections(databaseId);
    const usersCollection = collections.collections.find(
      (collection) => collection.name === "users"
    );
    const postsCollection = collections.collections.find(
      (collection) => collection.name === "posts"
    );
    const savesCollection = collections.collections.find(
      (collection) => collection.name === "saves"
    );
    const likesCollection = collections.collections.find(
      (collection) => collection.name === "likes"
    );

    // Check if the necessary collections exist
    if (!usersCollection || !postsCollection) {
      console.log(
        "Users or Posts collections don't exist yet. Skipping relationship creation."
      );
      return;
    }

    // Create relationship between users and posts collections
    try {
      // First check if relationship already exists to avoid errors
      const userAttributes = await databases.listAttributes(
        databaseId,
        usersCollection.$id
      );
      const hasPostsRelationship = userAttributes.attributes.some(
        (attr) => attr.key === "posts"
      );

      if (!hasPostsRelationship) {
        await databases.createRelationshipAttribute(
          databaseId,
          usersCollection.$id,
          postsCollection.$id,
          RelationshipType.ManyToOne,
          true, // Two-way relationship
          "posts",
          "creator",
          RelationMutate.SetNull
        );
        console.log("Created relationship between users and posts collections");
      } else {
        console.log("Relationship between users and posts already exists");
      }
    } catch (error) {
      console.error(
        "Error creating relationship between users and posts:",
        error
      );
    }

    // Create relationships for saves collection if it exists
    if (savesCollection) {
      try {
        const savesAttributes = await databases.listAttributes(
          databaseId,
          savesCollection.$id
        );
        const hasUserRelationship = savesAttributes.attributes.some(
          (attr) => attr.key === "user"
        );

        if (!hasUserRelationship) {
          await databases.createRelationshipAttribute(
            databaseId,
            savesCollection.$id,
            usersCollection.$id,
            RelationshipType.ManyToOne,
            true,
            "user",
            "saves",
            RelationMutate.SetNull
          );
          console.log(
            "Created relationship between saves and users collections"
          );
        }

        const hasPostRelationship = savesAttributes.attributes.some(
          (attr) => attr.key === "post"
        );

        if (!hasPostRelationship) {
          await databases.createRelationshipAttribute(
            databaseId,
            savesCollection.$id,
            postsCollection.$id,
            RelationshipType.ManyToOne,
            true,
            "post",
            "savedBy",
            RelationMutate.SetNull
          );
          console.log(
            "Created relationship between saves and posts collections"
          );
        }
      } catch (error) {
        console.error(
          "Error creating relationships for saves collection:",
          error
        );
      }
    }

    // Create relationships for likes collection if it exists
    if (likesCollection) {
      try {
        const likesAttributes = await databases.listAttributes(
          databaseId,
          likesCollection.$id
        );
        const hasUserRelationship = likesAttributes.attributes.some(
          (attr) => attr.key === "user"
        );

        if (!hasUserRelationship) {
          await databases.createRelationshipAttribute(
            databaseId,
            likesCollection.$id,
            usersCollection.$id,
            RelationshipType.ManyToOne,
            true,
            "user",
            "likes",
            RelationMutate.SetNull
          );
          console.log(
            "Created relationship between likes and users collections"
          );
        }

        const hasPostRelationship = likesAttributes.attributes.some(
          (attr) => attr.key === "post"
        );

        if (!hasPostRelationship) {
          await databases.createRelationshipAttribute(
            databaseId,
            likesCollection.$id,
            postsCollection.$id,
            RelationshipType.ManyToOne,
            true,
            "post",
            "likedBy",
            RelationMutate.SetNull
          );
          console.log(
            "Created relationship between likes and posts collections"
          );
        }
      } catch (error) {
        console.error(
          "Error creating relationships for likes collection:",
          error
        );
      }
    }

    console.log("Finished creating relationships");
  } catch (error) {
    console.error("Error creating relationships:", error);
  }
}

/**
 * Initialize the database by creating all necessary collections
 * @param {string} databaseId - The database ID to use
 */
export async function initializeDatabase(databaseId) {
  try {
    // First create all collections without relationships
    await createUsersCollection(databaseId);
    await createPostsCollection(databaseId);
    await createSavesCollection(databaseId);
    await createLikesCollection(databaseId);

    // Then establish all relationships after collections are created
    await createRelationships(databaseId);

    console.log("Database initialized successfully with all relationships");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
