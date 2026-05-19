const fs = require('fs').promises;
const path = require('path');

class JsonUserService {
    constructor() {
        this.dbPath = path.join(process.cwd(), 'database.json');
    }

    /**
     * auto read JSON file and convert to JavaScript object
     * automatically make one if didn't exist
     */
    async _readDB() {
        try {
            const data = await fs.readFile(this.dbPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                const initialDB = { users: [] };
                await this._writeDB(initialDB);
                return initialDB;
            }
            throw error;
        }
    }

    /**
     * Saving JavaScript object to database.json
     */
    async _writeDB(data) {
        await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    /**
     * Search user data by Telegram ID
     */
    async getUser(telegramId) {
        const db = await this._readDB();
        const user = db.users.find(u => u.telegramId === telegramId.toString());
        return user || null;
    }

    /**
     * Creating new user to database
     */
    async createUser(telegramId, username, language = 'en') {
        const db = await this._readDB();
        
        const newUser = {
            telegramId: telegramId.toString(),
            isBanned: false,
            username: username || 'Unknown',
            customId: `USER-${telegramId}`,
            limitQuota: 100,
            language: language,
            joinedAt: new Date().toISOString()
        };
        
        db.users.push(newUser);
        await this._writeDB(db);
        
        console.log(`[DB-JSON] New users created: ${username}`);
        return newUser;
    }

    /**
     * Update user data 
     */
    async updateUser(telegramId, updateData) {
        const db = await this._readDB();
        const index = db.users.findIndex(u => u.telegramId === telegramId.toString());
        
        if (index !== -1) {
            db.users[index] = { ...db.users[index], ...updateData };
            await this._writeDB(db);
            return db.users[index];
        }
        return null;
    }

    /**
     * Delete multiple user by user ID array
     */
    async deleteUsers(telegramIds) {
        const db = await this._readDB();
        const idsToDelete = Array.isArray(telegramIds) ? telegramIds : [telegramIds.toString()];
        
        const initialCount = db.users.length;
        db.users = db.users.filter(u => !idsToDelete.includes(u.telegramId));
        
        await this._writeDB(db);
        return initialCount - db.users.length;
    }
}

module.exports = new JsonUserService();