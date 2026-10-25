const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// यहाँ अपने चैनल का असली 'Request to Join' वाला इनवाइट लिंक डाल दे
const CHANNEL_JOIN_REQUEST_LINK = "https://t.me/+YOUR_CHANNEL_JOIN_REQUEST_LINK_HERE";

// Meta CAPI Credentials (तू चाहें तो इन्हें environment variables में भी रख सकता है)
const PIXEL_ID = "2394103828073019";
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN || "YOUR_META_CAPI_ACCESS_TOKEN";

app.get('/redirect', async (req, res) => {
    const eventId = req.query.event_id || "event_" + Date.now();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const clientUserAgent = req.headers['user-agent'];

    // Meta Conversions API (CAPI) को सर्वर साइड से इवेंट भेजना
    try {
        await axios.post(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
            data: [
                {
                    event_name: "Subscribe",
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: eventId,
                    action_source: "website",
                    event_source_url: "https://suryaavipgroup.netlify.app",
                    user_data: {
                        client_ip_address: clientIp,
                        client_user_agent: clientUserAgent
                    }
                }
            ],
            access_token: ACCESS_TOKEN
        });
    } catch (error) {
        console.error("CAPI Error:", error.response?.data || error.message);
    }

    // यूजर को सीधे Telegram Channel की Request to Join लिंक पर भेज देना
    res.redirect(302, CHANNEL_JOIN_REQUEST_LINK);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
