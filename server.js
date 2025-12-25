// const { setDefaultResultOrder } = require("node:dns");
// setDefaultResultOrder("ipv6first");
// use above if you are facing nodeDNS issue 
const tg = require('./TelegramClient/tgClient');
const oci = require('./TelegramClient/helpers/oci/client/ociClient');
const bot = require('./TelegramBot/telegraf/telegraf');

( async()=>{
  try {
     oci.Connect();
    await tg.TgInit();
    await bot.launch()
  } catch (error) {
  console.log(error)
  }
})()