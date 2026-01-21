const IORedis = require('ioredis');
const { Queue } = require('bullmq');

// Redis connection for the producer
const queueConnection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  tls: {} // if required for redis or valkey certificate issue
});

module.exports.getConnection=()=>{
  return queueConnection;
}
module.exports.getProducer=()=>{
  return  new Queue('downloadQueue', {
  connection: queueConnection,
});
}

