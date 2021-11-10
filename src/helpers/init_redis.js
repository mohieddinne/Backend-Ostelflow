var JWTRedisSession = require("jwt-redis-session"),
  express = require("express"),
  redis = require("redis");

var redisClient = redis.createClient(),
  secret = generateSecretKeySomehow(),
  app = express();

app.use(
  JWTRedisSession({
    client: redisClient,
    secret: secret,
    keyspace: "sess:",
    maxAge: 86400,
    algorithm: "HS256",
    requestKey: "jwtSession",
    requestArg: "jwtToken",
  })
);
