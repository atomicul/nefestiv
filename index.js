import qrc from "qrcode-terminal";
import { Client } from "whatsapp-web.js";
import * as fs from 'node:fs/promises';
import { exit } from "node:process";

const clog = console.log;

const PHONE_NUM = "40755101165";

//WHATSAPP
const client = new Client();
const CHAT = PHONE_NUM + '@c.us';

client.on("qr", (qr) => {
  qrc.generate(qr, { small: true });
});

function initializeClient() {
  return new Promise((res) => {
    client.on("ready", () => {
      clog("Connected to WhatsApp");
      res(Date.now());
    });
    client.initialize();
  })
}

const sendNMessages = (chat, list) => {
  if(!list.length) return;
  chat.sendMessage(list.shift());
  setTimeout(() => sendNMessages(chat, list), 700);
}

const startTime = await initializeClient();
const timeLeft = () => {
  const time = Date.now() - startTime;
  let ore = Math.floor(time/3600000);
  let minute = (Math.floor(time/60000)%60);
  let secunde = (Math.floor(time/1000)%60);
  return (ore ? ore.toString() + " de ore și " : "") + (minute ? minute.toString() + " de minute și " : "" ) + secunde.toString() + " secunde";
};

const chat = await client.getChatById(CHAT);
const letters = (await fs.readFile("spamletters", 'utf-8')).split("\r\n");


let printXLetterTimeout;
const printXLetter = (i = 0) => {
  const out = [];
  for(let j = 0; j<4; j++) {
    out.push(Array(Math.floor(Math.random()*10)%3+2).join(letters[i]));
  }
  clog(out);
  sendNMessages(chat, out);
  printXLetterTimeout = setTimeout(() => printXLetter((i+1)%letters.length), 60000);
}
printXLetter();  

const msgFunc = (msg) => {
  msg.getChat().then( msgChat => {
    if(msgChat.id.user === chat.id.user) {
      client.removeListener("message", msgFunc);
      clearTimeout(printXLetterTimeout);
      const MESAJE = ["spor la cafeluța biologică", "ma bucur că te-ai hotărât să răspunzi după " + timeLeft() , "să îmi trimiți și mie lecțiile la bio pls", "iți mulțumesc în avans și îți doresc o zi de colecție"];
      msg.reply("Bună dimineața suflet drag");
      sendNMessages(chat, MESAJE);
    }
  })
}

client.on("message", msgFunc);

