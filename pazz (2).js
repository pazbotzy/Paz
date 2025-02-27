/*
×××××××××××××××××××××××××××××××××××××
-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
×××××××××××××××××××××××××××××××××××××
Made By @pazbotz
Telegram https://t.me/pazbotz
YouTube https://youtube.com/@pazbotz
Thanks To
-ChatGPT
×××××××××××××××××××××××××××××××××××××
-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
×××××××××××××××××××××××××××××××××××××
*/


const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const axios = require('axios');
const path =require('path')
const os = require('os');
const yts = require('yt-search')
const ytsdl = require('ytdl-core')
const { tiktokDl } = require ('./scraper')
const settings = require('./settings');
const domains = require('./domains');
const tokens = require('./tokens');
const botToken = settings.token;
const owner = settings.adminId;
const adminfile = 'adminID.json';
const premiumUsersFile = 'premiumUsers.json';
const crypto = require('crypto');
const domain = settings.domain;
const plta = settings.plta;
const pltc = settings.pltc;
const userTransactions = {};
const moment = require('moment-timezone');
const timestamp = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');
console.log(timestamp);
const { Client } = require('ssh2');
try {
premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
} catch (error) {
    console.error('Error reading premiumUsers file:', error);
}
const bot = new TelegramBot(botToken, { polling: true });
try {
    adminUsers = JSON.parse(fs.readFileSync(adminfile));
} catch (error) {
    console.error('Error reading adminUsers file:', error);
}
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) { // Panjang kata sandi 12 karakter
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
   return password;
}
//sistem Ping 
const { performance } = require('perf_hooks');
function createProgressBar(used, total) {
    const percent = (used / total) * 100;
    const barLength = 20; // Panjang progress bar
    const filledLength = Math.round((percent / 100) * barLength);
   const emptyLength = barLength - filledLength;
   const progress = '█'.repeat(filledLength) + ' '.repeat(emptyLength);
   return `RAM Usage: [${progress}] ${percent.toFixed(2)}%`;
}
function runtime(seconds) {
    const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
   const secondsRemaining = Math.floor(seconds % 60);
    return `${hours} hours ${minutes} minutes ${secondsRemaining} seconds`;

}

const userChatsFile = path.resolve(__dirname, 'userChat.json');
const jadwalSholat = {
  shubuh: '04:45',
  dzuhur: '12:13',
  ashar: '15:48',
  magrib: '18:21',
  isya: '19:31',
};

// Variabel untuk menyimpan data pengguna
let userChats = {};

// Fungsi untuk memuat file JSON
const loadUserChats = () => {
  if (fs.existsSync(userChatsFile)) {
    userChats = JSON.parse(fs.readFileSync(userChatsFile, 'utf-8'));
    console.log('Data pengguna berhasil dimuat.');
  } else {
    fs.writeFileSync(userChatsFile, JSON.stringify(userChats, null, 2));
    console.log('File userChat.json dibuat.');
  }
};

// Fungsi untuk menyimpan data ke file JSON
const saveUserChats = () => {
  fs.writeFileSync(userChatsFile, JSON.stringify(userChats, null, 2));
  console.log('Data pengguna berhasil disimpan.');
};

// Load data pengguna saat bot dimulai
loadUserChats();

// Fungsi untuk mendapatkan waktu saat ini
const getCurrentTime = () => {
  const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Interval untuk notifikasi salat
setInterval(async () => {
  const timeNow = getCurrentTime();

  for (let [sholat, waktu] of Object.entries(jadwalSholat)) {
    if (timeNow === waktu) {
      for (let chatId in userChats) {
        if (userChats[chatId].notificationsOn) {
          try {
            // Path foto dan audio
            const photoPath = path.resolve(__dirname, 'temp/jadwal_sholat.jpg'); // Ganti dengan path foto
            const audioPath = path.resolve(__dirname, 'temp/adzan.mp3'); // Ganti dengan path audio adzan

            // Mengirim foto dengan teks dalam caption
            await bot.sendPhoto(chatId, photoPath, {
              caption: `
*${waktu}*/n saat ini telah masuk waktu *${sholat}/nuntuk wilayah Pandeglang,Banten dan sekitarnya/n /n selamat menunaikan sholat ${sholat}
`,
              parse_mode: 'Markdown',
            });

            // Mengirim audio adzan
            await bot.sendAudio(chatId, audioPath, {
              title: `Adzan - Waktu Salat ${sholat}`,
            });

          } catch (err) {
            console.error(`Gagal mengirim ke ID ${chatId}:`, err);
          }
        }
      }
    }
  }
}, 60000);

// Menangani pesan pengguna
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Otomatis tambahkan pengguna ke JSON jika belum ada
  if (!userChats[chatId]) {
    userChats[chatId] = { notificationsOn: true };
    saveUserChats();
    console.log(`Pengguna/grup baru ditambahkan: ${chatId}`);
  }

  const text = msg.text?.toLowerCase();

  // Perintah untuk mengaktifkan notifikasi
  if (text === '/jadwal_adzan') {
    userChats[chatId].notificationsOn = true;
    saveUserChats();
    bot.sendMessage(chatId, '✅ Pengingat adzan telah *diaktifkan*. Anda akan menerima notifikasi adzan sesuai jadwal.', {
      parse_mode: 'Markdown',
    });
  }

  // Perintah untuk menonaktifkan notifikasi
  if (text === '/stop_adzan') {
    userChats[chatId].notificationsOn = false;
    saveUserChats();
    bot.sendMessage(chatId, '❌ Pengingat adzan telah *dinonaktifkan*. Anda tidak akan menerima notifikasi adzan.', {
      parse_mode: 'Markdown',
    });
  }
});

// Hapus pengguna jika bot dikeluarkan dari grup
bot.on('left_chat_member', (msg) => {
  const chatId = msg.chat.id;
  if (msg.left_chat_member.username === bot.username) {
    delete userChats[chatId];
    saveUserChats();
    console.log(`Bot telah dikeluarkan dari grup: ${msg.chat.title}`);
  }
});

const {
    default: baileys,
    proto,
    jidNormalizedUser,
    generateWAMessage,
    generateWAMessageFromContent,
    getContentType,
    prepareWAMessageMedia,
} = require("@whiskeysockets/baileys");

             
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
const photoURL = [
    'https://cdn.xtermai.xyz/LI1DW.jpg',
'https://cdn.xtermai.xyz/w124B.jpg',
'https://cdn.xtermai.xyz/nnpme.jpg'];//photo URL

const menuPage1 = `
📌 Bot information 
🤖 𝐍𝐚𝐦𝐞 𝐁𝐨𝐭 : *AsistenPanel*  
👤 𝐎𝐰𝐧𝐞𝐫   : @pazbotz
👥 𝐂𝐫𝐞𝐚𝐭𝐨𝐫𝐬  : @pazbotz
🕑 𝐓𝐢𝐦𝐞     : ${new Date(). toLocaleString('id-ID',{timeZone :'Asia/Jakarta'})};
 

𝐒𝐈𝐋𝐀𝐇𝐊𝐀𝐍 𝐊𝐋𝐈𝐊 𝐓𝐎𝐌𝐁𝐎𝐋 **𝐍𝐄𝐗𝐓**
𝐔𝐍𝐓𝐔𝐊 𝐌𝐄𝐋𝐈𝐇𝐀𝐓 𝐌𝐄𝐍𝐔 𝐘𝐀𝐍𝐆 𝐀𝐃𝐀`;


const menuPage2 = `
 *𝙢𝙚𝙣𝙪 𝙤𝙬𝙣𝙚𝙧*
- /addowner
- /addprem
- /addreseller
- /delreseller
- /delprem
- /delowner
- /antilink
- /ping`;

const menuPage3 = `
 *𝙥𝙩𝙚𝙧𝙤𝙙𝙖𝙘𝙩𝙮𝙡 𝙞𝙣𝙨𝙩𝙖𝙡𝙡𝙡𝙚𝙧*
- /installpanel
- /uninstallpanel
- /installwings
- /uninstallpanel
- /domainlist`;

const menuPage4 = `
 *𝙞𝙣𝙨𝙩𝙖𝙡𝙡 𝙩𝙝𝙚𝙢𝙖*
- /stellar
- /billing
- /elysium
- /enigma
- /uninstallthema`;

const menuPage5 = `
 *𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝙢𝙚𝙣𝙪*
- /tiktok
- /play
- /tourl
- /brat
- /bratvid`;

const menuPage6 = `
 *𝙘𝙧𝙚𝙖𝙩𝙚 𝙥𝙖𝙣𝙚𝙡*
- /1gb -10gb (namapanel,idtele) 
- /createadmin
- /listsrv
- /listusr
- /delserver
- /deladmin
- /clearserver
- /clearuser`;


const menuButtons1 = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "Next ➡️", callback_data: "menu2" }]
        ]
    }
};

const menuButtons2 = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "Back↩️", callback_data: "menu1" }],
            [{ text: "Next ➡️", callback_data: "menu3" }]
        ]
    }
};

const menuButtons3 = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "Back↩️", callback_data: "menu2" }],
            [{ text: "Next ➡️", callback_data: "menu4" }]
        ]
    }
};

const menuButtons4 = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "Back↩️", callback_data: "menu3" }],
            [{ text: "Next ➡️", callback_data: "menu5" }]
        ]
    }
};

const menuButtons5 = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "Back↩️", callback_data: "menu4" }],
            [{ text: "Next ➡️", callback_data: "menu6" }]
        ]
    }
};

const menuButtons6 = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "Back↩️", callback_data: "menu5" }],
            [{ text: "Next ➡️", callback_data: "menu1" }]
        ]
    }
};

// Tangani perintah /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if (!userIds.includes(userId)) {
    userIds.push(userId);
    saveUserIds(userIds);};

    // Tampilkan halaman pertama dengan foto

const randomPhotoURL = photoURL[Math.floor(Math.random() * photoURL.length)];
await bot.sendPhoto(chatId, randomPhotoURL, {

    caption: menuPage1,

    parse_mode: "Markdown",

    ...menuButtons1

});
});

// Tangani tombol "Next" dan "Back"
bot.on("callback_query", async (callbackQuery) => {
    const { data, message } = callbackQuery;

    try {
        if (data === "menu2") {
            // Edit tampilan ke menu kedua
            await bot.editMessageCaption(menuPage2, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                parse_mode: "Markdown",
                ...menuButtons2
            });
        } else if (data === "menu1") {
            // Edit tampilan ke menu pertama
            await bot.editMessageCaption(menuPage1, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                parse_mode: "Markdown",
                ...menuButtons1
            });
        } else if (data === "menu3") {
            // Edit tampilan ke menu ketiga
            await bot.editMessageCaption(menuPage3, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                parse_mode: "Markdown",
                ...menuButtons3
            });
        } else if (data === "menu4") {
            // Edit tampilan ke menu keempat
            await bot.editMessageCaption(menuPage4, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                parse_mode: "Markdown",
                ...menuButtons4
                });
        } else if (data === "menu5") {
            // Edit tampilan ke menu kelima
            await bot.editMessageCaption(menuPage5, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                parse_mode: "Markdown",
                ...menuButtons5
                });
        } else if (data === "menu6") {
            // Edit tampilan ke menu keenam
            await bot.editMessageCaption(menuPage6, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                parse_mode: "Markdown",
                ...menuButtons6
                });
        }

        // Jawab callback agar tombol tidak "berputar"
        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error("Error handling callback query:", error);
    }
});
//=======================≠=================
// Command untuk menambahkan user premium
bot.onText(/\/addprem (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];

    if (msg.from.id.toString() === owner) {
        if (!premiumUsers.includes(userId)) {
            premiumUsers.push(userId);
            fs.writeFileSync(premiumUsersFile, JSON.stringify(premiumUsers));
            bot.sendMessage(chatId, `User ${userId} telah ditambahkan ke daftar premium.`);
        } else {
            bot.sendMessage(chatId, `User ${userId} sudah termasuk pengguna premium.`);
        }
    } else {
        bot.sendMessage(chatId, 'Hanya pemilik bot yang dapat melakukan tindakan ini.');
    }
});

// Command untuk menghapus user premium
bot.onText(/\/delprem (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];

    if (msg.from.id.toString() === owner) {
        const index = premiumUsers.indexOf(userId);
        if (index !== -1) {
            premiumUsers.splice(index, 1);
            fs.writeFileSync(premiumUsersFile, JSON.stringify(premiumUsers));
            bot.sendMessage(chatId, `User ${userId} telah dihapus dari daftar premium.`);
        } else {
            bot.sendMessage(chatId, `User ${userId} bukan pengguna premium.`);
        }
    } else {
        bot.sendMessage(chatId, 'Hanya pemilik bot yang dapat melakukan tindakan ini.');
    }
});

// Command untuk menambahkan admin
bot.onText(/\/addowner (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];

    if (msg.from.id.toString() === owner) {
        if (!adminUsers.includes(userId)) {
            adminUsers.push(userId);
            fs.writeFileSync(adminfile, JSON.stringify(adminUsers));
            bot.sendMessage(chatId, `User ${userId} telah ditambahkan sebagai admin.`);
        } else {
            bot.sendMessage(chatId, `User ${userId} sudah menjadi admin.`);
        }
    } else {
        bot.sendMessage(chatId, 'Hanya pemilik bot yang dapat melakukan tindakan ini.');
    }
});

// Command untuk menghapus admin
bot.onText(/\/delowner (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];

    if (msg.from.id.toString() === owner) {
        const index = adminUsers.indexOf(userId);
        if (index !== -1) {
            adminUsers.splice(index, 1);
            fs.writeFileSync(adminfile, JSON.stringify(adminUsers));
            bot.sendMessage(chatId, `User ${userId} telah dihapus sebagai admin.`);
        } else {
            bot.sendMessage(chatId, `User ${userId} bukan seorang admin.`);
        }
    } else {
        bot.sendMessage(chatId, 'Hanya pemilik bot yang dapat melakukan tindakan ini.');
    }
});
//==========================================================================
bot.onText(/^(\.|\#|\/)installpanel$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `𝗙𝗼𝗿𝗺𝗮𝘁 𝘀𝗮𝗹𝗮𝗵!\n𝗣𝗲𝗻𝗴𝗴𝘂𝗻𝗮𝗮𝗻: /𝗶𝗻𝘀𝘁𝗮𝗹𝗹𝗽𝗮𝗻𝗲𝗹1 𝗶𝗽𝘃𝗽𝘀,𝗽𝗮𝘀𝘀𝘄𝗼𝗿𝗱𝘃𝗽𝘀,𝗱𝗼𝗺𝗮𝗶𝗻𝗽𝗻𝗹,𝗱𝗼𝗺𝗮𝗶𝗻𝗻𝗼𝗱𝗲,𝟭𝟲𝟬𝟬𝟬𝟬𝟬𝟬`);
  });

bot.onText(/\/installpanel1 (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const t = text.split(',');

  if (t.length < 3) {
    return bot.sendMessage(chatId, '𝗙𝗼𝗿𝗺𝗮𝘁 𝘀𝗮𝗹𝗮𝗵!\n𝗣𝗲𝗻𝗴𝗴𝘂𝗻𝗮𝗮𝗻: /𝗶𝗻𝘀𝘁𝗮𝗹𝗹𝗽𝗮𝗻𝗲𝗹1 𝗶𝗽𝘃𝗽𝘀,𝗽𝗮𝘀𝘀𝘄𝗼𝗿𝗱𝘃𝗽𝘀,𝗱𝗼𝗺𝗮𝗶𝗻𝗽𝗻𝗹,𝗱𝗼𝗺𝗮𝗶𝗻𝗻𝗼𝗱𝗲,𝗿𝗮𝗺𝘃𝗽𝘀 ( ᴄᴏɴᴛᴏʜ : 𝟾𝟶𝟶𝟶 = ʀᴀᴍ 𝟾');
  }

  const ipvps = t[0];
  const passwd = t[1];
  const subdomain = t[2];
  const domainnode = t[3];
  const ramvps = t[4];

  
  const connSettings = {
    host: ipvps,
    port: 22,
    username: 'root',
    password: passwd
  };

  const password = generateRandomPassword();
  const command = 'bash <(curl -s https://pterodactyl-installer.se)';
  const commandWings = 'bash <(curl -s https://pterodactyl-installer.se)';
  const conn = new Client();

  conn.on('ready', () => {
    bot.sendMessage(chatId, 'Proses penginstalan sedang berlangsung mohon menunggu 3-5 Menit');
    
    conn.exec(command, (err, stream) => {
      if (err) {
        bot.sendMessage(chatId, 'Maaf terjadi kesalahan saat menjalankan perintah ');
        conn.end();
        return;
      }

      stream.on('close', (code, signal) => {
        console.log(`Stream closed with code ${code} and signal ${signal}`);
        installWings(conn, domainnode, subdomain, password, ramvps);
      }).on('data', (data) => {
        handlePanelInstallationInput(data, stream, subdomain, password);
      }).stderr.on('data', (data) => {
        console.log('STDERR: ' + data);
      });
    });
  }).on('error', (err) => {
    // Tangani error jika koneksi gagal
    if (err.message.includes('All configured authentication methods failed')) {
      bot.sendMessage(chatId, 'Koneksi gagal: Kata sandi salah atau VPS tidak dapat diakses.');
    } else if (err.message.includes('connect ECONNREFUSED')) {
      bot.sendMessage(chatId, 'Koneksi gagal: VPS tidak bisa diakses atau mati.');
    } else {
      bot.sendMessage(chatId, `Koneksi gagal: ${err.message}`);
    }
    console.error('Connection Error: ', err.message);
  }).connect(connSettings);
  
  async function installWings(conn, domainnode, subdomain, password, ramvps) {
    bot.sendMessage(chatId, 'Proses penginstalan **wings** sedang berlangsung mohon menunggu 3-5 Menit');
    conn.exec(commandWings, (err, stream) => {
      if (err) {
        bot.sendMessage(chatId, 'Terjad kesalahan saat instalasi wings.');
        conn.end();
        return;
      }
      
      stream.on('close', (code, signal) => {
        console.log(`Wings installation stream closed with code ${code} and signal ${signal}`);
        createNode(conn, domainnode, ramvps, subdomain, password);
      }).on('data', (data) => {
        handleWingsInstallationInput(data, stream, domainnode, subdomain);
      }).stderr.on('data', (data) => {
        console.log('STDERR: ' + data);
      });
    });
  }

  async function createNode(conn, domainnode, ramvps, subdomain, password) {
    const command = 'bash <(curl -s https://raw.githubusercontent.com/LeXcZxMoDz9/Installerlex/refs/heads/main/install.sh)';
    bot.sendMessage(chatId, 'Memulai create node & Location');
    
    conn.exec(command, (err, stream) => {
      if (err) {
        bot.sendMessage(chatId, 'Terkadi kesalahan saat membuat node.');
        conn.end();
        return;
      }

      stream.on('close', (code, signal) => {
        console.log(`Node creation stream closed with code ${code} and ${signal} signal`);
        conn.end();
        sendPanelData(subdomain);
      }).on('data', (data) => {
        handleNodeCreationInput(data, stream, domainnode, ramvps);
      }).stderr.on('data', (data) => {
        console.log('STDERR: ' + data);
      });
    });
  }

  function sendPanelData(subdomain) {
    bot.sendMessage(chatId, `𝗗𝗮𝘁𝗮 𝗽𝗮𝗻𝗲𝗹 𝗮𝗻𝗱𝗮\n\n𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: pazbotz \n𝗣𝗮𝘀𝘀𝘄𝗼𝗿𝗱: pazbotz\n𝗟𝗼𝗴𝗶𝗻: ${subdomain}\n\n𝗡𝗼𝘁𝗲: Semua instalasi telah selesai. Silahkan create allocation di node yang sudah di buatkan & ambil token konfigurasi, lalu install wings dengan mengetik /wings.`);
  }

  function handlePanelInstallationInput(data, stream, subdomain, password) {
    if (data.toString().includes('Input')) {
      stream.write('0\n');
    }
    if (data.toString().includes('Input')) {
            stream.write(`${password}\n`);
        }
        if (data.toString().includes('Input')) {
            stream.write(`${password}\n`);
        }
        if (data.toString().includes('Input')) {
            stream.write(`${password}\n`);
        }
        if (data.toString().includes('Input')) {
            stream.write('Asia/Jakarta\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('pazbotz@gmail.com\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('pazbotz@gmail.com\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('pazbotz\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('pazbotz\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('pazbotz\n');
        }
        if (data.toString().includes('Input')) {
            stream.write(`sevsbotz\n`);
        }
        if (data.toString().includes('Input')) {
            stream.write(`${subdomain}\n`);
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('yes\n');
        }
        if (data.toString().includes('Please read the Terms of Service')) {
            stream.write('Y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('1\n');
        }
    console.log('STDOUT: ' + data);
  }

  function handleWingsInstallationInput(data, stream, domainnode, subdomain) {
    if (data.toString().includes('Input')) {
      stream.write('1\n');
    }
    if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write(`${subdomain}\n`);
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write(`${password}\n`);
        }
        if (data.toString().includes('Input')) {
            stream.write(`${password}\n`);
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write(`${domainnode}\n`);
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('pazbotz@gmail.com\n');
        }
        if (data.toString().includes('Input')) {
            stream.write('y\n');
        }
    console.log('STDOUT: ' + data);
  }

  function handleNodeCreationInput(data, stream, domainnode, ramvps) {
    stream.write('4\n');
    stream.write('PAZBOTZ\n');
    stream.write('PAZBOTZ\n');
    stream.write(`${domainnode}\n`);
    stream.write('PAZBOTZ\n');
    stream.write(`${ramvps}\n`);
    stream.write(`${ramvps}\n`);
    stream.write('1\n');
    console.log('STDOUT: ' + data);
  }
});
// =========================================================================
bot.onText(/^(\.|\#|\/)wings$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Formt salah !\nPenggunaan: /wings ipvps,password,token`);
  });
bot.onText(/\/wings (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const t = text.split(',');
  if (t.length < 3) {
    return bot.sendMessage(chatId, 'Format salah!\nPenggunaan: /wings ipvps, passwordvps,token');
  }
  const ipvps = t[0];
  const passwd = t[1];
  const token = t[2];

  const connSettings = {
    host: ipvps,
    port: 22,
    username: 'root',
    password: passwd
  };
    const conn = new Client();
    const command = 'bash <(curl -s https://raw.githubusercontent.com/pazbotzy/pazbotz/refs/heads/main/install.sh)'
 
    conn.on('ready', () => {
        isSuccess = true; // Set flag menjadi true jika koneksi berhasil
        bot.sendMessage(chatId,'Proses StartWings')
        
        conn.exec(command, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream closed with code ${code} and ${signal} signal');
         bot.sendMessage(chatId, 'success startwings');
                conn.end();
            }).on('data', (data) => {
                stream.write('3\n');
                stream.write(`${token}\n`)
                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).on('error', (err) => {
        console.log('Connection Error: ' + err);
        bot.sendMessage(chatId, 'Katasandi atau IP tidak valid');
    }).connect(connSettings);
});
// =========================================================================
bot.onText(/^(\.|\#|\/)uninstallpanel$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `𝗙𝗼𝗿𝗺𝗮𝘁 𝘀𝗮𝗹𝗮𝗵!\n𝗣𝗲𝗻𝗴𝗴𝘂𝗻𝗮𝗮𝗻: /𝘂𝗻𝗶𝗻𝘀𝘁𝗮𝗹𝗹𝗽𝗮𝗻𝗲𝗹 𝗶𝗽𝘃𝗽𝘀,𝗽𝗮𝘀𝘀𝘄𝗼𝗿𝗱`);
  });
bot.onText(/\/uninstallpanel (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const t = text.split(',');
  if (t.length < 2) {
    return bot.sendMessage(chatId, '𝗙𝗼𝗿𝗺𝗮𝘁 𝘀𝗮𝗹𝗮𝗵!\n𝗣𝗲𝗻𝗴𝗴𝘂𝗻𝗮𝗮𝗻: /𝘂𝗻𝗶𝗻𝘀𝘁𝗮𝗹𝗹𝗽𝗮𝗻𝗲𝗹 𝗶𝗽𝘃𝗽𝘀,𝗽𝗮𝘀𝘀𝘄𝗼𝗿𝗱');
  }
  const ipvps = t[0];
  const passwd = t[1];

  const connSettings = {
    host: ipvps,
    port: 22,
    username: 'root',
    password: passwd
  };
    const conn = new Client();
    const command = 'bash <(curl https://raw.githubusercontent.com/RuztanHosting/RuzPrivat/main/install.sh)'
 
    conn.on('ready', () => {
        isSuccess = true; // Set flag menjadi true jika koneksi berhasil
        bot.sendMessage(chatId,'Proses uninstall panel')
        
        conn.exec(command, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream closed with code ${code} and ${signal} signal');
         bot.sendMessage(chatId, 'Succes uninstall panel');
                conn.end();
            }).on('data', (data) => {
                stream.write('RuztanXD\n');
                stream.write(`5\n`);
                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).on('error', (err) => {
        console.log('Connection Error: ' + err);
        bot.sendMessage(chatId, 'Katasandi atau IP tidak valid');
    }).connect(connSettings);
});
//==========================================================================
bot.onText(/^(\.|\#|\/)uninstalltheme$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Format salah!\nPenggunaan: /uninstalltheme ipvps,password`);
  });
// Menangani perintah /nebula
bot.onText(/\/uninstalltheme (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    let t = text.split(',');
    if (t.length < 2) {
        return bot.sendMessage(chatId, `Format salah!\nPenggunaan: /uninstalltheme ipvps,password`);
    }

    let ipvps = t[0];
    let passwd = t[1];
    

    const connSettings = {
        host: ipvps,
        port: '22',
        username: 'root',
        password: passwd
    };

    const command = 'bash <(curl -s https://raw.githubusercontent.com/pazbotzy/pazbotz/refs/heads/main/install.sh)';

    const conn = new Client();
    let isSuccess = false; // Flag untuk menentukan keberhasilan koneksi

    conn.on('ready', () => {
        isSuccess = true; // Set flag menjadi true jika koneksi berhasil
        bot.sendMessage(chatId, 'Proses uninstall theme di mulai mohon tunggu 3-6 menit');

        conn.exec(command, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream closed with code ' + code + ' and signal ' + signal);
                bot.sendMessage(chatId, '`Uninstall theme succes, silahkan cek web panel anda`');
                conn.end();
            }).on('data', (data) => {
                stream.write('2\n');
                stream.write('yes\n');

                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).on('error', (err) => {
        console.log('Connection Error: ' + err);
        bot.sendMessage(chatId, 'Katasandi atau IP tidak valid');
    }).connect(connSettings);

    setTimeout(() => {
        if (isSuccess) {
            bot.sendMessage(chatId, '');
        }
    }, 180000); // 180000 ms = 3 menit
});
//==========================================================================
bot.onText(/^(\.|\#|\/)$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `𝗙𝗼𝗿𝗺𝗮𝘁 𝘀𝗮𝗹𝗮𝗵!\n𝗣𝗲𝗻𝗴𝗴𝘂𝗻𝗮𝗮𝗻: /hackbackpanel 𝗶𝗽𝘃𝗽𝘀,𝗽𝗮𝘀𝘀𝘄𝗼𝗿𝗱`);
  });
bot.onText(/\/hackbackpanel (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const t = text.split(',');
  if (t.length < 2) {
    return bot.sendMessage(chatId, '𝗙𝗼𝗿𝗺𝗮𝘁 𝘀𝗮𝗹𝗮𝗵!\n𝗣𝗲𝗻𝗴𝗴𝘂𝗻𝗮𝗮𝗻: /hackbackpanel 𝗶𝗽𝘃𝗽𝘀,𝗽𝗮𝘀𝘀𝘄𝗼𝗿𝗱');
  }
  const ipvps = t[0];
  const passwd = t[1];

  const connSettings = {
    host: ipvps,
    port: 22,
    username: 'root',
    password: passwd
  };
    const conn = new Client();
    const command = 'bash <(curl -s https://raw.githubusercontent.com/pazbotzy/pazbotz/refs/heads/main/install.sh)'
 
    conn.on('ready', () => {
        isSuccess = true; // Set flag menjadi true jika koneksi berhasil
        bot.sendMessage(chatId,'Proses hackback panel')
        
        conn.exec(command, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream closed with code ${code} and ${signal} signal');
         bot.sendMessage(chatId, '𝗗𝗮𝘁𝗮 𝗽𝗮𝗻𝗲𝗹 \n\n𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: pazbotz\n𝗣𝗮𝘀𝘀𝘄𝗼𝗿𝗱: pazbotz\n𝗡𝗼𝘁𝗲: Jangan sebar **IP** VPS anda biar tidak di rusuh oleh orang yang gak bertanggung jawab. ');
                conn.end();
            }).on('data', (data) => {
                stream.write('7\n');
                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).on('error', (err) => {
        console.log('Connection Error: ' + err);
        bot.sendMessage(chatId, 'Katasandi atau IP tidak valid');
    }).connect(connSettings);
});
//==========================================================================
bot.onText(/^(\.|\#|\/)elysium$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Format salah!\nPenggunaan: /elysium ipvps,password`);
  });
bot.onText(/\/elysium (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    let t = text.split(',');
    if (t.length < 2) {
        return bot.sendMessage(chatId, `Format salah!\nPenggunaan: /elysium ipvps,password`);
    }

    let ipvps = t[0];
    let passwd = t[1];
    

    const connSettings = {
        host: ipvps,
        port: '22',
        username: 'root',
        password: passwd
    };

    const command = 'bash <(curl -s https://raw.githubusercontent.com/sevsbotz/sevsrawr/refs/heads/main/installp.sh)';

    const conn = new Client();
    let isSuccess = false; // Flag untuk menentukan keberhasilan koneksi

    conn.on('ready', () => {
        isSuccess = true; // Set flag menjadi true jika koneksi berhasil
        bot.sendMessage(chatId, 'Proses install theme di mulai mohon tunggu beberapa menit');

        conn.exec(command, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream closed with code ' + code + ' and signal ' + signal);
                bot.sendMessage(chatId, '`success install theme elysium`');
                conn.end();
            }).on('data', (data) => {
                stream.write('1\n');
                stream.write('y\n');
                stream.write('yes\n');

                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).on('error', (err) => {
        console.log('Connection Error: ' + err);
        bot.sendMessage(chatId, 'Katasandi atau IP tidak valid');
    }).connect(connSettings);

    setTimeout(() => {
        if (isSuccess) {
            bot.sendMessage(chatId, '');
        }
    }, 60000); // 180000 ms = 3 menit
});
// =========================================================================
bot.onText(/^(\.|\#|\/)billing$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Format salah!\nPenggunaan: /billing ipvps,password`);
  });
// Menangani perintah /installdepend
bot.onText(/\/billing (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    let t = text.split(',');
    if (t.length < 2) {
        return bot.sendMessage(chatId, `Format salah!\nPenggunaan: /billing ipvps,password`);
    }

    let ipvps = t[0];
    let passwd = t[1];
    

    const connSettings = {
        host: ipvps,
        port: '22',
        username: 'root',
        password: passwd
    };

    const command = 'bash <(curl -s https://raw.githubusercontent.com/SkyzoOffc/Pterodactyl-Theme-Autoinstaller/main/install.sh)';

    const conn = new Client();
    let isSuccess = false; // Flag untuk menentukan keberhasilan koneksi

    conn.on('ready', () => {
        isSuccess = true; // Set flag menjadi true jika koneksi berhasil
        bot.sendMessage(chatId, 'Proses install theme di mulai mohon tunggu beberapa menit');

        conn.exec(command, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream closed with code ' + code + ' and signal ' + signal);
                bot.sendMessage(chatId, '`Scces install theme billing`');
                conn.end();
            }).on('data', (data) => {
                stream.write(`pazbotz\n`)
                stream.write(`1\n`)
                stream.write(`2\n`)
                stream.write(`yes\n`)
                stream.write(`x\n`)

                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).on('error', (err) => {
        console.log('Connection Error: ' + err);
        bot.sendMessage(chatId, 'Katasandi atau IP tidak valid');
    }).connect(connSettings);

    setTimeout(() => {
        if (isSuccess) {
            bot.sendMessage(chatId, '');
        }
    }, 60000); // 180000 ms = 3 menit
});
// =========================================================================
bot.onText(/\/listdomain/, (msg) => {
    const chatId = msg.chat.id;
    const teks = `List Domain Yang Tersedia :\n\n` +
        `/d1 ${domains.tld1}\n` +
        `/d2 ${domains.tld2}\n` +
        `/d3 ${domains.tld3}\n` +
        `/d4 ${domains.tld4}\n` +
        `/d5 ${domains.tld5}\n` +
        `/d6 ${domains.tld6}\n` +
        `/d7 ${domains.tld7}\n` +
        `/d8 ${domains.tld8}\n` +
        `/d9 ${domains.tld9}\n` +
        `/d0 ${domains.tld0}\n\n` +
        `Contoh Cara Membuat Subdomain :\n` +
        `ketik /d1 hostname|ipvps\n\n` +
        `Contoh Cara Melihat Subdomain :\n` +
        `ketik /listsubdomain d1`;
    bot.sendMessage(chatId, teks);
});

bot.onText(/^(\.|\#|\/)listsubdomain$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Format salah!\nPenggunaan: /listsubdomain d1`);
  });
bot.onText(/\/listsubdomain (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const dom = match[1].toLowerCase();

    let zonenya, apinya;
    switch (dom) {
        case "d1":
            zonenya = domains.zone1;
            apinya = tokens.apitoken1;
            break;
            case "d2":
            zonenya = domains.zone2;
            apinya = tokens.apitoken2;
            break;
            case "d3":
            zonenya = domains.zone3;
            apinya = tokens.apitoken3;
            break;
            case "d4":
            zonenya = domains.zone4;
            apinya = tokens.apitoken4;
            break;
            case "d5":
            zonenya = domains.zone5;
            apinya = tokens.apitoken5;
            break;
            case "d6":
            zonenya = domains.zone6;
            apinya = tokens.apitoken6;
            break;
            case "d7":
            zonenya = domains.zone7;
            apinya = tokens.apitoken7;
            break;
            case "d8":
            zonenya = domains.zone8;
            apinya = tokens.apitoken8;
            break;
            case "d9":
            zonenya = domains.zone9;
            apinya = tokens.apitoken9;
            break;
            case "d0":
            zonenya = domains.zone0;
            apinya = tokens.apitoken0;
        // Add cases for other domains here
        default:
            return bot.sendMessage(chatId, "Domain tidak valid, silakan coba lagi.");
    }

    axios.get(`https://api.cloudflare.com/client/v4/zones/${zonenya}/dns_records`, {
        headers: {
            Authorization: `Bearer ${apinya}`,
            "Content-Type": "application/json",
        },
    }).then(async (res) => {
        if (res.data.result.length < 1) return bot.sendMessage(chatId, "Tidak Ada Subdomain");
        let teks = `🌐 LIST SUBDOMAIN ${dom.toUpperCase()}\n\nTotal Subdomain : ${res.data.result.length}\n\n`;
        res.data.result.forEach(e => teks += `Domain : ${e.name}\nIP : ${e.content}\n\n`);
        bot.sendMessage(chatId, teks);
    }).catch(() => {
        bot.sendMessage(chatId, "Terjadi kesalahan saat mengambil data subdomain.");
    });
});

bot.onText(/^(\.|\#|\/)(d[09])$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Format salah!\nPenggunaan: /d1 namamu|ipvps`);
  });
bot.onText(/\/(d[0-9]) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const command = match[1];
    const text = match[2];

    let [host, ip] = text.split("|");
    if (!host || !ip) return bot.sendMessage(chatId, "Format yang benar: /d1 nama|ipvps");

    let zonenya, apinya, tldnya;
    switch (command) {
        case "d1":
            zonenya = domains.zone1;
            apinya = tokens.apitoken1;
            tldnya = domains.tld1;
            break;
            case "d2":
            zonenya = domains.zone2;
            apinya = tokens.apitoken2;
            tldnya = domains.tld2;
            break;
            case "d3":
            zonenya = domains.zone3;
            apinya = tokens.apitoken3;
            tldnya = domains.tld3;
            break;
            case "d4":
            zonenya = domains.zone4;
            apinya = tokens.apitoken4;
            tldnya = domains.tld4;
            break;
            case "d5":
            zonenya = domains.zone5;
            apinya = tokens.apitoken5;
            tldnya = domains.tld5;
            break;
            case "d6":
            zonenya = domains.zone6;
            apinya = tokens.apitoken6;
            tldnya = domains.tld6;
            break;
            case "d7":
            zonenya = domains.zone7;
            apinya = tokens.apitoken7;
            tldnya = domains.tld7;
            break;
            case "d8":
            zonenya = domains.zone8;
            apinya = tokens.apitoken8;
            tldnya = domains.tld8;
            break;
            case "d9":
            zonenya = domains.zone9;
            apinya = tokens.apitoken9;
            tldnya = domains.tld9;
            break;
            case "d0":
            zonenya = domains.zone0;
            apinya = tokens.apitoken0;
            tldnya = domains.tld0;
        // Add cases for other domains here
    }

    host = host.trim().replace(/[^a-z0-9.-]/gi, "");
    ip = ip.trim().replace(/[^0-9.]/gi, "");
    if (!host || ip.split(".").length !== 4) return bot.sendMessage(chatId, "Format host atau IP tidak valid.");

    axios.post(`https://api.cloudflare.com/client/v4/zones/${zonenya}/dns_records`, {
        type: "A",
        name: `${host}.${tldnya}`,
        content: ip,
        ttl: 3600,
        priority: 10,
        proxied: false
    }, {
        headers: {
            Authorization: `Bearer ${apinya}`,
            "Content-Type": "application/json",
        },
    }).then((res) => {
        if (res.data.success) {
            bot.sendMessage(chatId, `Subdomain Berhasil Dibuat ✅\n\nDomain Induk 🌐\n${tldnya}\nIP 📡\n${res.data.result.content}\nSubdomain 🌐\n${res.data.result.name}`);
        } else {
            bot.sendMessage(chatId, "Gagal membuat subdomain.");
        }
    }).catch(() => {
        bot.sendMessage(chatId, "Terjadi kesalahan saat membuat subdomain.");
    });
});

//
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//kode di menu
bot.onText(/\/mafia/, async (msg) => {
  let chatId = msg.chat.id;
  let username = msg.chat.username;
  bot.sendMessage(chatId, `🔪🔥 Selamat datang di dunia bayangan, ${username}!\n\nDi 𝗠𝗮𝗳𝗶𝗮 𝗚𝗮𝗺𝗲𝘀, kepercayaan adalah ilusi, dan setiap orang bisa menjadi musuh dalam selimut. Untuk memulai permainan, kumpulkan 4 orang lainnya—karena hanya dengan 5 pemain, permainan bisa dimulai! 🕵️‍♂️💀\n\nKetik /mulai dan bersiaplah untuk menyusun strategi, berbohong, atau mengungkap kebenaran.\n\n⚠️ Siapkah kamu bertahan di tengah pengkhianatan?`);
});
//kode game
let gameSessions = {};
const roles = ["mafia", "doctor", "game", "villager", "villager"];

function shuffleRoles() {
  return [...roles].sort(() => Math.random() - 0.5);
}

// Fungsi untuk mencatat log peristiwa
function logEvent(chatId, message) {
  if (!gameSessions[chatId].log) {
    gameSessions[chatId].log = [];
  }
  gameSessions[chatId].log.push(message);
}

bot.onText(/\/mulai/, (msg) => {
  let chatId = msg.chat.id;
  if (gameSessions[chatId]) return bot.sendMessage(chatId, "Game sudah dimulai!");

  gameSessions[chatId] = {
    players: [],
    rolesAssigned: false,
    nightPhase: false,
    mafiaChoice: null,
    doctorChoice: null,
    detectiveChoice: null,
    votes: {},
    log: [],
  };

  bot.sendMessage(chatId, "🌙 Malam telah tiba di desa yang penuh misteri...\nGunakan /join untuk bergabung (max 5 pemain).");
});

bot.onText(/\/join/, (msg) => {
  let chatId = msg.chat.id;
  let userId = msg.from.id;
  let username = msg.from.username || msg.from.first_name;

  if (!gameSessions[chatId]) return bot.sendMessage(chatId, "Game belum dimulai. Gunakan /mulai.");
  if (gameSessions[chatId].players.some((p) => p.id === userId)) return bot.sendMessage(chatId, "Kamu sudah bergabung!");
  if (gameSessions[chatId].players.length >= 5) return bot.sendMessage(chatId, "Game penuh!");

  gameSessions[chatId].players.push({ id: userId, username });

  bot.sendMessage(chatId, `✅ ${username} bergabung!`);

  if (gameSessions[chatId].players.length === 5) assignRoles(chatId);
});

function assignRoles(chatId) {
  let session = gameSessions[chatId];
  let shuffledRoles = shuffleRoles();

  session.players.forEach((player, index) => {
    player.role = shuffledRoles[index];
    bot.sendMessage(player.id, `🔍 Peran kamu adalah **${player.role.toUpperCase()}**!`);
  });

  session.rolesAssigned = true;
  startNight(chatId);
}

function startNight(chatId) {
  let session = gameSessions[chatId];
  session.nightPhase = true;
  session.mafiaChoice = null;
  session.doctorChoice = null;
  session.detectiveChoice = null;

  bot.sendMessage(chatId, "🌙 Semua warga tertidur... Tapi di balik kegelapan, sesuatu terjadi!");

  let mafia = session.players.find((p) => p.role === "mafia");
  let doctor = session.players.find((p) => p.role === "doctor");
  let detective = session.players.find((p) => p.role === "detective");

  let targetButtons = session.players.filter((p) => p.id !== mafia.id).map((v) => [{ text: v.username, callback_data: `kill_${chatId}_${v.id}` }]);
  bot.sendMessage(mafia.id, "🔪 Pilih siapa yang akan kamu habisi malam ini:", { reply_markup: { inline_keyboard: targetButtons } });

  let doctorButtons = session.players.map((p) => [{ text: p.username, callback_data: `protect_${chatId}_${p.id}` }]);
  bot.sendMessage(doctor.id, "🛡 Pilih siapa yang ingin kamu lindungi:", { reply_markup: { inline_keyboard: doctorButtons } });

  let detectiveButtons = session.players.map((p) => [{ text: p.username, callback_data: `investigate_${chatId}_${p.id}` }]);
  bot.sendMessage(detective.id, "🕵️‍♂️ Pilih siapa yang ingin kamu selidiki:", { reply_markup: { inline_keyboard: detectiveButtons } });

  setTimeout(() => {
    if (!session.mafiaChoice) session.mafiaChoice = session.players.find((p) => p.role === "villager")?.id;
    if (!session.doctorChoice) session.doctorChoice = session.players.find((p) => p.id !== session.mafiaChoice)?.id;
    processNight(chatId);
  }, 30000);
}

bot.on("callback_query", (callbackQuery) => {
  let [action, chatId, targetId] = callbackQuery.data.split("_");
  let session = gameSessions[chatId];

  if (!session || !session.nightPhase) return;

  if (action === "kill") session.mafiaChoice = targetId;
  if (action === "protect") session.doctorChoice = targetId;
  if (action === "investigate") {
    session.detectiveChoice = targetId;
    let target = session.players.find((p) => p.id == targetId);
    bot.sendMessage(callbackQuery.from.id, `🕵️‍♂️ ${target.username} adalah **${target.role === "mafia" ? "Mafia" : "Bukan Mafia"}**!`);
  }

  if (session.mafiaChoice && session.doctorChoice) processNight(chatId);
});

function processNight(chatId) {
  let session = gameSessions[chatId];
  session.nightPhase = false;

  let mafiaTarget = session.mafiaChoice;
  let doctorSave = session.doctorChoice;
  let eliminatedPlayer = mafiaTarget !== doctorSave ? session.players.find((p) => p.id === mafiaTarget) : null;

  if (eliminatedPlayer) {
    session.players = session.players.filter((p) => p.id !== mafiaTarget);
    logEvent(chatId, `💀 Malam yang kelam... ${eliminatedPlayer.username} ditemukan tak bernyawa!`);
  } else {
    logEvent(chatId, `✨ Seorang warga hampir terbunuh, tetapi sang Dokter berhasil menyelamatkannya!`);
  }

  bot.sendMessage(chatId, eliminatedPlayer ? `💀 ${eliminatedPlayer.username} terbunuh!` : "✨ Dokter menyelamatkan seseorang malam ini!");
  startVoting(chatId);
}

function startVoting(chatId) {
  let session = gameSessions[chatId];

  bot.sendMessage(chatId, "☀️ Siang tiba! Warga berkumpul untuk berdiskusi dan voting.");

  session.players.forEach((player) => {
    let voteButtons = session.players.filter((p) => p.id !== player.id).map((p) => [{ text: p.username, callback_data: `vote_${chatId}_${p.id}` }]);
    bot.sendMessage(player.id, "Siapa yang mencurigakan?", { reply_markup: { inline_keyboard: voteButtons } });
  });

  setTimeout(() => processVoting(chatId), 30000);
}

function processVoting(chatId) {
  let session = gameSessions[chatId];

  if (!session || !session.players.length) {
    bot.sendMessage(chatId, "❌ Voting tidak valid, permainan dihentikan.");
    delete gameSessions[chatId];
    return;
  }

  let voteCounts = {};
  Object.values(session.votes).forEach((id) => {
    voteCounts[id] = (voteCounts[id] || 0) + 1;
  });

  let maxVotes = Math.max(...Object.values(voteCounts), 0);
  let votedOutId = Object.keys(voteCounts).find((id) => voteCounts[id] === maxVotes);

  let votedOut = session.players.find((p) => p.id == votedOutId);

  if (!votedOut) {
    bot.sendMessage(chatId, "⚠️ Tidak ada yang mendapatkan cukup suara untuk dieliminasi.");
    startNight(chatId);
    return;
  }

  session.players = session.players.filter((p) => p.id !== votedOut.id);
  bot.sendMessage(chatId, `🚨 ${votedOut.username} (${votedOut.role}) telah dieliminasi!`);
  
  checkGameOver(chatId);
}

function checkGameOver(chatId) {
  let session = gameSessions[chatId];
  let mafiaCount = session.players.filter((p) => p.role === "mafia").length;
  let villagerCount = session.players.length - mafiaCount;

  let winnerMessage = mafiaCount === 0 ? "🎉 Warga menang! Desa kembali aman." : "💀 Mafia menang! Desa telah jatuh ke tangan kejahatan.";
  
  bot.sendMessage(chatId, winnerMessage);
  showGameRecap(chatId);
  delete gameSessions[chatId];
}

function showGameRecap(chatId) {
  let session = gameSessions[chatId];
  bot.sendMessage(chatId, `📜 **Rekap Peristiwa:**\n\n${session.log.join("\n")}`);
}
//menghentikan game mafia
bot.onText(/\/berhenti/, (msg) => {
  let chatId = msg.chat.id;
  if (!gameSessions[chatId]) {
    return bot.sendMessage(chatId, "⚠️ Tidak ada permainan yang sedang berlangsung.");
  }
 delete gameSessions[chatId]; // Hapus sesi permainan
  bot.sendMessage(chatId, "❌ Permainan telah dihentikan oleh admin.");
});
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^(\.|\#|\/)stellar$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Format salah!\nPenggunaan: /stellar ipvps,password`);
  });
bot.onText(/\/slellar (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    let t = text.split(',');
    if (t.length < 2) {
        return bot.sendMessage(chatId, `Format salah!\nPenggunaan: /stellar ipvps,password`);
    }

    let ipvps = t[0];
    let passwd = t[1];
    

    const connSettings = {
        host: ipvps,
        port: '22',
        username: 'root',
        password: passwd
    };

    const command = 'bash <(curl -s https://raw.githubusercontent.com/Zeroneoffc/Auto-installer-pterodactyl/main/install.sh))';

    const conn = new Client();
    let isSuccess = false; // Flag untuk menentukan keberhasilan koneksi

    conn.on('ready', () => {
        isSuccess = true; // Set flag menjadi true jika koneksi berhasil
        bot.sendMessage(chatId, 'Proses install theme di mulai mohon tunggu beberapa menit');

        conn.exec(command, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream closed with code ' + code + ' and signal ' + signal);
                bot.sendMessage(chatId, '`Succes install theme stellar`');
                conn.end();
            }).on('data', (data) => {
                stream.write(`zerone\n`)
                stream.write('1\n');
                stream.write('y\n');
                stream.write('yes\n');

                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).on('error', (err) => {
        console.log('Connection Error: ' + err);
        bot.sendMessage(chatId, 'Katasandi atau IP tidak valid');
    }).connect(connSettings);

    setTimeout(() => {
        if (isSuccess) {
            bot.sendMessage(chatId, '');
        }
    }, 60000); // 180000 ms = 3 menit
});

//----------------------------------------

// Nama file untuk menyimpan daftar ID pengguna

const USER_IDS_FILE = 'idpengguna.json';

// Fungsi untuk memuat daftar ID pengguna dari file

function loadUserIds() {

  try {

    const data = fs.readFileSync(idpengguna);

    return JSON.parse(data);

  } catch (err) {

    return [];

  }

}

// Fungsi untuk menyimpan daftar ID pengguna ke file

function saveUserIds(userIds) {

  fs.writeFileSync(USER_IDS_FILE, JSON.stringify(userIds, null, 2));

}

// Daftar ID pengguna yang terdaftar

let userIds = loadUserIds();

// Inisialisasi bot
  
// Menyebarkan pesan ke semua pengguna terdaftar

bot.onText(/\/broadcast (.+)/, (msg, match) => {           
  const message = match[1];

  if (message) {

    userIds.forEach((userId) => {

      bot.sendMessage(userId, message).catch((err) => {

        console.error(`Error sending message to ${userId}:`, err);

      });

    });

    bot.sendMessage(msg.chat.id, `Pesan telah disiarkan ke ${userIds.length} pengguna.`);

  } else {

    bot.sendMessage(msg.chat.id, 'Silakan masukkan pesan untuk disiarkan.');

  }

});
//--------------------------------------------
bot.onText(/^(\.|\#|\/)play$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `format salah example /play bunga terakhir`);
  });

  bot.onText(/\/play (.+)/, async (msg, match) => {    const chatId = msg.chat.id;
    const query = match[1];
    if (!query) {
       return bot.sendMessage(chatId, 'Contoh penggunaan:\n\n/play Pulang - Wali Band');
   }
   try {
        const search = await yts(query);
       if (!search || search.all.length === 0) {
           return bot.sendMessage(chatId, 'Lagu yang Anda cari tidak ditemukan.');
        }
       const video = search.videos[0];
        const detail = `
🎵 **YouTube Audio Play** 🎶
✨ **Judul Lagu**: ${video.title}
👁️‍🗨️ **Penonton**: ${video.views}
🎤 **Pengarang**: ${video.author.name}
📅 **Diunggah**: ${video.ago}
🔗 **Tonton Selengkapnya**: [Klik Disini](${video.url})`;
        await bot.sendMessage(chatId, detail, { parse_mode: 'Markdown' });       
   } catch (error) {
        console.error('Error:', error.message);
        bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses permintaan Anda.');
    }
});


//-------------------------------------------


bot.onText(/\/ping/, (msg) => {
    const chatId = msg.chat.id;
    const start = performance.now();
    const totalRam = os.totalmem() / Math.pow(1024, 3); // Convert bytes to GB
    const freeRam = os.freemem() / Math.pow(1024, 3);
    const usedRam = totalRam - freeRam;
    const progressBar = createProgressBar(usedRam, totalRam);
    const serverInfo = `
*🔴 Bot Information*
🖥 CPU: *${os.cpus().length} Core, ${os.cpus()[0].model}*
🕡 Uptime: *${Math.floor(os.uptime() / 86400)} days*
🕡 Runtime: *${runtime(process.uptime())}*
💾 RAM: *${freeRam.toFixed(2)} GB / ${totalRam.toFixed(2)} GB*
⚡ Speed: *${(performance.now() - start).toFixed(5)} ms*
${progressBar}

`;
    bot.sendMessage(chatId, serverInfo, { parse_mode: 'Markdown' });

});


//---------------------------------------------


bot.onText(/^(\.|\#|\/)tiktok$/, async (msg) => {

    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `Format salah example /tiktok link`);

  });

  

bot.onText(/\/tiktok (.+)/, async (msg, match) => {

    const chatId = msg.chat.id;

    const text = match[1]; // Mengambil teks setelah perintah /tt

    if (!text.startsWith("https://")) {

        return bot.sendMessage(chatId, "Masukkan URL TikTok yang valid!");

    }

    try {

        bot.sendMessage(chatId, "⏳ Sedang memproses...");

        const result = await tiktokDl(text);

        if (!result.status) {

            return bot.sendMessage(chatId, "Terjadi kesalahan saat memproses URL!");

        }

        if (result.durations === 0 && result.duration === "0 Seconds") {

            let mediaArray = [];

            for (let i = 0; i < result.data.length; i++) {

                const a = result.data[i];

                mediaArray.push({

                    type: 'photo',

                    media: a.url,

                    caption: `Foto Slide Ke ${i + 1}`

                });

            }

            return bot.sendMediaGroup(chatId, mediaArray);

        } else {

            const video = result.data.find(e => e.type === "nowatermark_hd" || e.type === "nowatermark");

            if (video) {

                return bot.sendVideo(chatId, video.url, { caption: "Succes downloader" });

            }

        }

    } catch (e) {

        console.error(e);

        bot.sendMessage(chatId, "Terjadi kesalahan saat memproses permintaan.");

    }

});



//=========================================

const downloadFile = async (url, path) => {

    const response = await axios({

        url,

        method: 'GET',

        responseType: 'stream',

    });

    return new Promise((resolve, reject) => {

        response.data.pipe(fs.createWriteStream(path))

            .on('finish', () => resolve())

            .on('error', (e) => reject(e));

    });

};

bot.onText(/^(\.|\#|\/)brat$/, async (msg) => {

    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `Format salah example /brat katakatabebas`);

  });

  

bot.onText(/\/brat (.+)/, async (msg, match) => {

    const chatId = msg.chat.id;

    const text = match[1];

    if (!text) {

        return bot.sendMessage(chatId, 'Contoh penggunaan: /brat teksnya');

    }

    try {

        const imageUrl = `https://kepolu-brat.hf.space/brat?q=${encodeURIComponent(text)}`;

        const tempFilePath = './temp_sticker.webp';

        const downloadFile = async (url, dest) => {

            const writer = fs.createWriteStream(dest);

            const response = await axios({

                url,

                method: 'GET',

                responseType: 'stream',

            });

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {

                writer.on('finish', resolve);

                writer.on('error', reject);

            });

        };

        await downloadFile(imageUrl, tempFilePath);

        await bot.sendSticker(chatId, tempFilePath);

        await fs.promises.unlink(tempFilePath);

    } catch (error) {

        console.error(error.message || error);

        bot.sendMessage(chatId, 'Terjadi kesalahan saat membuat stiker. Pastikan teks valid atau coba lagi.');

    }

});
            


            console.log('Bot is running...');