const mongoClient = require("mongodb").MongoClient;
const settings = {
    mongoConfig: {
        serverUrl: "mongodb+srv://marisha:marisha@cluster0.m4iod.mongodb.net/boom?retryWrites=true&w=majority",
        database: "boom",
    },
};
const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

module.exports = {
    connectToDb: async () => {
        if (!_connection) {
            _connection = await mongoClient.connect(mongoConfig.serverUrl);
            _db = await _connection.db(mongoConfig.database);
        }

        return _db;
    },
    closeConnection: () => {
        _connection.close();
    },
};
