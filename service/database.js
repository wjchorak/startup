import { MongoClient } from 'mongodb';
import config from './dbConfig.json' with { type: 'json' };

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('startup');
const userCollection = db.collection('user');
const creditsCollection = db.collection('credits');

(async function testConnection() {
    try {
        await db.command({ ping: 1 });
        console.log(`Connect to database`);
    } catch (ex) {
        console.log(`Unable to connect to database with ${url} because ${ex.message}`);
        process.exit(1);
    }
})();

function getUser(userName) {
    return userCollection.findOne({ userName: userName });
}

function getUserByToken(token) {
    return userCollection.findOne({ token: token });
}

async function addUser(user) {
    await userCollection.insertOne(user);
}

async function updateUser(user) {
    await userCollection.updateOne({ userName: user.userName }, { $set: user });
}

async function replenishCredits() {
    const result = await userCollection.updateMany(
        { credits: { $lte: 0 } },
        { $set: { credits: 20 } }
    );

    console.log(`Replenished credits for ${result.modifiedCount} users`);
}

async function updateCredits(newCredits) {
    await creditsCollection.deleteMany({ name: newCredits.name });
    return creditsCollection.insertOne(newCredits);
}

function getCredits() {
    const query = { credits: { $gt: 0, $lt: 10000 } };
    const options = {
        sort: { credits: -1 },
        limit: 3,
    };
    const cursor = creditsCollection.find(query, options);
    return cursor.toArray();
}

const DatabaseAPI = {
    getUser,
    getUserByToken,
    addUser,
    updateUser,
    replenishCredits,
    updateCredits,
    getCredits,
    db,
};

export default DatabaseAPI;