require('dotenv').config();
const { QueueEvents } = require('bullmq');
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const bullmqProducer = require('../bullmq/producer');

//bullmq producer
const producer = bullmqProducer.getProducer();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));


bot.on('message', async (ctx) => {
    try {

        // Use the forwardMessage method
        const forwarded = await ctx.telegram.forwardMessage(
            process.env.TG_GROUP_ID, // The ID of the destination group
            ctx.chat.id,     // The ID of the source chat (current chat)
            ctx.message.message_id// The ID of the message to forward
        );
        await producer.add('downloadQueue', { user_id: ctx.message.from.id, message: forwarded.message_id }, { removeOnComplete: true, removeOnFail: true });
        ctx.reply('Media Download Initiated 👍');
    } catch (error) {
        console.error(error);
        ctx.reply('Failed');
    }

});
const queueEvents = new QueueEvents('downloadQueue', {
    connection: bullmqProducer.getConnection(),
});
queueEvents.on('progress', async ({ data }) => {
    if (data.user_id) {
        await bot.telegram.sendMessage(data.user_id, `Download progress: ${data.progress}`);
    }
});
queueEvents.on('completed', async ({ jobId, returnvalue }) => {
    const { status, par, user_id, error } = returnvalue;
    if (status === 'completed') {
        await bot.telegram.sendMessage(user_id, `✅ Download finished: ${par}`);
    } else {
        await bot.telegram.sendMessage(user_id, { message: `❌ Download failed` });
    }
});

module.exports.launch= async () => {
    bot.launch();
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
