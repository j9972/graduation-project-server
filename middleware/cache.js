const redis = require("redis");

const client = redis.createClient();

client.connect();

// redis에 데이터 저장
const set = (key, value) => {
  client.set(key, JSON.stringify(value));
};

// 저장 된 데이터를 redis에서 가져오는 미들웨어
const get = (req, res, next) => {
  // End-Point의 url을 key로 설정
  let key = req.originalUrl;

  client.get(key, (error, data) => {
    if (error) {
      res.status(400).send({
        ok: false,
        message: error,
      });
    }
    if (data !== null) {
      // 데이터가 cache되어 있으면, parsing하여 response
      console.log("cache hit");
      res.status(200).send({
        ok: true,
        data: JSON.parse(data),
      });
    } else {
      console.log("cache miss");
      next();
    }
  });
};

// Redis middleware
const getOrSetCache = (key, cb) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, async (error, data) => {
      if (error) return reject(error);
      if (data != null) return resolve(JSON.parse(data)); // hit
      const freshData = await cb();
      redisClient.SETEX(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
      resolve(freshData);
    });
  });
};

module.exports = {
  set,
  get,
};
