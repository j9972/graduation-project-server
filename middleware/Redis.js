// redis를 통헤 response 의 속도를 줄일 수 있다.
// params로 특정 값 ex) photos/1 이런식으로 접근하면 response 속도가 더 빨리짐
const redis = require("redis");

const DEFAULT_EXPIRATION = 3600; // 3600ms

// redis-cli에 접근할때 사용 -> ex) redisClient.setex()
const redisClient = redis.createClient(); // ({url: defualt url})

const getOrSetCache = (key, cb) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, async (error, data) => {
      if (error) return reject(error);
      if (data != null) return resolve(JSON.parse(data));
      const freshData = await cb();
      redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
      resolve(freshData);
    });
  });
};

module.exports = { getOrSetCache };

/*
postman으로 response 속도 체크하면서 하기
*/

// 캐시 체크를 위한 미들웨어 another example
// checkCache = (req, res, next) => {
//     redis_client.get(req.url, (err, data) => {
//       if (err) {
//         console.log(err);
//         res.status(500).send(err);
//       }
//       // Redis에 저장된게 존재한다.
//       if (data != null) {
//         res.send(data);
//       } else {
//         // Redis에 저장된게 없기 때문에 다음 로직 실행
//         next();
//       }
//     });
//   };
