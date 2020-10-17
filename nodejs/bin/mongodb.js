const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";

const dbName = "MyIotSys";

var mongodb = {
  dbClient: null,
  db: null,
  insert: null,
  find: null,
};

// 连接数据库
MongoClient.connect(url, (err, mongoClient) => {
  if (err) return console.log("connect mongodb err: ", err);
  console.log("connect mongodb ok");

  mongodb.dbClient = mongoClient;
  mongodb.db = mongoClient.db(dbName);

  let collection = mongodb.db.collection("device-data");
  // 检查索引
  collection.indexExists("createdAt_1", (err, result) => {
    if (err) return console.log(err);
    if (!result) {
      console.log("create index: 'createAt' : expireAfterSeconds");
      collection.createIndex({ createAt: 1 }, { expireAfterSeconds: 3600 });
    }
  });
});
// 插入数据
mongodb.insert = function (data, callback) {
  if (mongodb.dbClient && mongodb.dbClient.isConnected()) {
    data.createAt = new Date();
    mongodb.db.collection("device-data").insertOne(data, (err, result) => {
      if (err) callback(err);
      callback(null, result);
    });
  }
  else callback("mongodb is not connected");
};
// 返回数据方式
const findOptions = {
    limit: 10,
    sort: {createAt: -1}
}
// 查找数据
mongodb.find = function (data, callback) {
  if (mongodb.dbClient && mongodb.dbClient.isConnected()) {
    mongodb.db.collection("device-data").find(data, findOptions).toArray((err, result) => {
        if(err) callback(err)
        callback(null, result)
    })
  }
  else callback("mongodb is not connected");
};
module.exports = mongodb;
