require('dotenv').config()
const IORedis = require('ioredis');
const { Worker } = require('bullmq');
const { TelegramClient, } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // npm i input
const StreemFile = require('./helpers/telegram/fileStreem');
const fetchMedia = require('./helpers/telegram/fetchMedia')

//BullMq Redis Connction
const workerConnection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});
// TELEGRAM SESSION
const stringSession = new StringSession(process.env.SESSION_ID); // fill this later with the value from session.save()
module.exports.TgInit = async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, +process.env.API_ID, process.env.API_HASH, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });

  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again

  // client.addEventHandler(async (event) => {
  // }, new NewMessage({ chats: [process.env.TG_GROUP_ID, 'USERNAME'] }));

  new Worker('downloadQueue', async job => {
    // Retrieve the specific message
    const messages = await client.getMessages(process.env.TG_GROUP_ID, { ids: [job.data.message] });

    const { fileName, target } = await fetchMedia(messages)
    const par = await StreemFile(client, target, fileName, job, { user_id: job.data.user_id });
    return { status: 'completed', par, user_id: job.data.user_id };
  }, {
    connection: workerConnection,
    removeOnComplete: true,
    removeOnFail: true
  });

}
