const tg = require('./TelegramClient/tgClient');
const oci = require('./TelegramClient/helpers/oci/client/ociClient');
const bot = require('./TelegramBot/telegraf/telegraf');

( async()=>{
  try {
    await oci.Connect();
    await tg.TgInit();
    await bot.launch()
  } catch (error) {
  console.log(error)
  }
})()