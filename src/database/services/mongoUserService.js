const User = require('../models/UserMongo'); 

class MongoUserService {
    /** Retrieves a user document from the database based on their Telegram ID.
     * * @param {string|number} telegramId - The unique identifier provided by Telegram.
     * @returns {Promise<Object|null>} The user document if found, otherwise null.
     */
    async getUser(telegramId) {
        try {
            return await User.findOne({ telegramId: telegramId.toString() });
        } catch (error) {
            console.error('[MongoService] Error fetching user:', error.message);
            throw error;
        }
    }

    
    /** Creates a new user record in the database.
     * * @param {string|number} telegramId - The unique identifier provided by Telegram.
     * @param {string} username - The user's Telegram username.
     * @param {string} [language='id'] - The user's preferred language code.
     * @returns {Promise<Object>} The newly created user document.
    */
    async createUser(telegramId, username, language = 'id') {
        try {
            const newUser = new User({
                telegramId: telegramId.toString(),
                isBanned: false,
                username: username || 'Unknown',
                customId: `USER-${telegramId}`,
                limitQuota: 100,
                language: language,
                joinedAt: new Date()
            });

            await newUser.save();
            console.log(`[MongoService] New user registered: ${username}`);
            
            return newUser;
        } catch (error) {
            console.error('[MongoService] Error creating user:', error.message);
            throw error;
        }
    }

    /**
     * Updates an existing user's document using partial data.
     * * @param {string|number} telegramId - The unique identifier provided by Telegram.
     * @param {Object} updateData - An object containing the specific fields to update.
     * @returns {Promise<Object|null>} The updated user document, or null if the user does not exist.
     */
    async updateUser(telegramId, updateData) {
        try {
            // The { new: true } option ensures the method returns the document 
            // after the update has been applied, rather than the original document.
            return await User.findOneAndUpdate(
                { telegramId: telegramId.toString() },
                { $set: updateData },
                { new: true }
            );
        } catch (error) {
            console.error('[MongoService] Error updating user:', error.message);
            throw error;
        }
    }

    /**
     * Deletes one or multiple users from the database.
     * * @param {string|number|Array<string|number>} telegramIds - A single ID or an array of Telegram IDs.
     * @returns {Promise<number>} The total count of deleted documents.
     */
    async deleteUsers(telegramIds) {
        try {
            // Standardize the input into an array of strings for the MongoDB $in operator.
            const idsToDelete = Array.isArray(telegramIds) 
                ? telegramIds.map(id => id.toString()) 
                : [telegramIds.toString()];

            const result = await User.deleteMany({
                telegramId: { $in: idsToDelete }
            });

            return result.deletedCount;
        } catch (error) {
            console.error('[MongoService] Error deleting users:', error.message);
            throw error;
        }
    }
}

// Export a single instance of the class (Singleton pattern) 
// to ensure a consistent connection interface across the application.
module.exports = new MongoUserService();