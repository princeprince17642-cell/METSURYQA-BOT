const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PIXEL_ID = '2394103828073019';
const META_CAPI_TOKEN = 'EAAQN2SBc9fYBS4emSyjpvw8ZC1QqzJHx8sR0BkNc5EX88dbZC4i716lvqV4rSUJBZAFfwWyyrP3ZAdmufGGXOGvS4qZCRxewYLUjZCXUQZByxfBgfSkY4oyXow8ZCAMvo1SIdTR9haZCAykugitIS9wLkbeiZC49twZAJ1rihZBPICp72MSMqyPJvMcrE3uTe4CTGQZDZD';
const TELEGRAM_BOT_TOKEN = '8635023714:AAGGrfnRui61L_h8omThYgLXnPmIJYATYxM';
const CHANNEL_INVITE_LINK = 'https://t.me/+hIBCZJfuZ6Y0Y2U1';
const BOT_USERNAME = 'SuryaVIPBot'; // यहाँ अपने बोट का सही यूजरनेम डाल दें

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const pendingSessions = new Map();

async function sendMetaCapiEvent(eventId, userData) {
  try {
    const payload = {
      data: [
        {
          event_name: 'Subscribe',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          user_data: {
            client_ip_address: userData.ip || undefined,
            client_user_agent: userData.userAgent || undefined
          },
          custom_data: {
            content_name: 'SURYA NUMBER KING VIP'
          }
        }
      ]
    };

    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`;
    await axios.post(url, payload);
    console.log(`[CAPI SUCCESS] Event ${eventId} fired!`);
  } catch (error) {
    console.error('[CAPI ERROR]', error.response ? error.response.data : error.message);
  }
}

app.get('/redirect', (req, res) => {
  const eventId = req.query.event_id || `evt_${Date.now()}_${Math.random().toString(36.substring(2, 7))}`;
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  pendingSessions.set(eventId, { ip: userIp, userAgent, timestamp: Date.now() });
  res.redirect(`https://t.me/${BOT_USERNAME}?start=${eventId}`);
});

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const eventId = match[1];

  if (eventId && pendingSessions.has(eventId)) {
    const session = pendingSessions.get(eventId);
    await sendMetaCapiEvent(eventId, session);
    pendingSessions.delete(eventId);
  }

  bot.sendMessage(chatId, '✅ Welcome to SURYA NUMBER KING VIP!\nClick below to join the channel:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 JOIN CHANNEL NOW', url: CHANNEL_INVITE_LINK }]
      ]
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
