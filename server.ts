import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { TikTokLiveClient, EventType } from 'piratetok-live-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory TikTok live state & SSE clients
let activeClient: TikTokLiveClient | null = null;
let currentUsername = '';
let connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error' = 'disconnected';
let lastStatusMessage = 'غير متصل بحساب تيك توك';
let sseClients: Response[] = [];

// Broadcast event to all connected web clients
function broadcastEvent(eventType: string, data: unknown) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch {
      // ignore closed connections
    }
  });
}

function cleanupConnection() {
  if (activeClient) {
    try {
      activeClient.disconnect();
    } catch {
      // ignore
    }
    activeClient = null;
  }
}

async function connectToTikTok(username: string) {
  cleanupConnection();
  currentUsername = username.trim().replace(/^@/, '');
  connectionStatus = 'connecting';
  lastStatusMessage = `جاري الاتصال مباشرة بغرفة بث @${currentUsername} بدون وسيط أو اشتراكات...`;
  broadcastEvent('status', { status: connectionStatus, message: lastStatusMessage, username: currentUsername });

  try {
    const client = new TikTokLiveClient(currentUsername);

    client.on(EventType.connected, (data: any) => {
      connectionStatus = 'connected';
      lastStatusMessage = `متصل بنجاح ببث @${currentUsername} (غرفة: ${data?.roomId || 'نشطة'}) 🟢`;
      broadcastEvent('status', { status: connectionStatus, message: lastStatusMessage, username: currentUsername });
    });

    client.on(EventType.chat, (data: any) => {
      const uname = data.user?.uniqueId || data.user?.id || 'متابع';
      const nickname = data.user?.nickname || uname;
      const avatarUrl = data.user?.profileThumb?.urlList?.[0] || data.user?.avatarThumb?.urlList?.[0] || `https://api.dicebear.com/7.x/bottts/svg?seed=${uname}`;
      const text = data.content || '';

      const commentPayload = {
        id: data.common?.msgId || `comm_${Date.now()}_${Math.random()}`,
        user: {
          id: `u_${uname}`,
          username: uname,
          nickname,
          avatarUrl,
          isFollower: Boolean(data.user?.followInfo?.followStatus && data.user.followInfo.followStatus > 0),
          taps: 0,
          shares: 0,
          reposts: 0,
          gamePoints: 0
        },
        text,
        timestamp: Date.now()
      };
      broadcastEvent('chat', commentPayload);
    });

    client.on(EventType.gift, (data: any) => {
      const uname = data.user?.uniqueId || data.user?.id || 'داعم';
      const nickname = data.user?.nickname || uname;
      const avatarUrl = data.user?.profileThumb?.urlList?.[0] || data.user?.avatarThumb?.urlList?.[0] || `https://api.dicebear.com/7.x/bottts/svg?seed=${uname}`;
      const rawGiftName = (data.gift?.name || data.giftDetails?.giftName || data.common?.describe || '').toLowerCase();

      let mappedType: 'rose' | 'coin' | 'finger_heart' | 'galaxy' | 'tiktok' = 'rose';
      if (rawGiftName.includes('finger') || rawGiftName.includes('heart') || data.giftId === 5655) {
        mappedType = 'finger_heart';
      } else if (rawGiftName.includes('coin') || rawGiftName.includes('عملة') || rawGiftName.includes('money')) {
        mappedType = 'coin';
      } else if (rawGiftName.includes('galaxy') || rawGiftName.includes('مجرة')) {
        mappedType = 'galaxy';
      } else if (rawGiftName.includes('tiktok') || rawGiftName.includes('تيك')) {
        mappedType = 'tiktok';
      }

      const giftPayload = {
        id: `gift_${Date.now()}_${Math.random()}`,
        user: {
          id: `u_${uname}`,
          username: uname,
          nickname,
          avatarUrl,
          isFollower: true,
          taps: 0,
          shares: 0,
          reposts: 0,
          gamePoints: 0
        },
        giftType: mappedType,
        giftName: data.gift?.name || data.giftDetails?.giftName || 'هدية',
        giftIcon: mappedType === 'rose' ? '🌹' : mappedType === 'finger_heart' ? '🫰' : mappedType === 'coin' ? '🪙' : '🎁',
        repeatCount: Number(data.repeatCount) || 1,
        timestamp: Date.now()
      };
      broadcastEvent('gift', giftPayload);
    });

    client.on(EventType.like, (data: any) => {
      const uname = data.user?.uniqueId || data.user?.id || 'متابع';
      broadcastEvent('like', {
        username: uname,
        count: Number(data.count) || 1
      });
    });

    client.on(EventType.social, (data: any) => {
      const uname = data.user?.uniqueId || data.user?.id || 'متابع';
      broadcastEvent('share', {
        username: uname,
        count: 1
      });
    });

    client.on(EventType.disconnected, () => {
      connectionStatus = 'disconnected';
      lastStatusMessage = 'تم انقطاع الاتصال بالبث المباشر';
      broadcastEvent('status', { status: connectionStatus, message: lastStatusMessage, username: currentUsername });
    });

    client.on(EventType.liveEnded, () => {
      connectionStatus = 'disconnected';
      lastStatusMessage = 'انتهى البث المباشر على تيك توك';
      broadcastEvent('status', { status: connectionStatus, message: lastStatusMessage, username: currentUsername });
    });

    // Connect directly to TikTok WSS
    const roomId = await client.connect();
    activeClient = client;
    connectionStatus = 'connected';
    lastStatusMessage = `متصل بنجاح ببث @${currentUsername} (غرفة: ${roomId}) 🟢`;
    broadcastEvent('status', { status: connectionStatus, message: lastStatusMessage, username: currentUsername, roomId });
    return { success: true, message: lastStatusMessage, roomId };
  } catch (err: any) {
    connectionStatus = 'error';
    const errText = err?.message || String(err);
    if (errText.includes('not currently live') || errText.includes('offline') || errText.includes('not found')) {
      lastStatusMessage = `الحساب @${currentUsername} ليس في بث مباشر الآن على تيك توك. افتح البث على تيك توك أولاً ثم أعد الاتصال.`;
    } else {
      lastStatusMessage = `تنبيه الاتصال: ${errText}`;
    }
    broadcastEvent('status', { status: connectionStatus, message: lastStatusMessage, username: currentUsername });
    return { success: false, message: lastStatusMessage };
  }
}

// SSE endpoint for frontend to receive live comments, gifts, and likes
app.get('/api/tiktok/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial status
  res.write(`event: status\ndata: ${JSON.stringify({ status: connectionStatus, message: lastStatusMessage, username: currentUsername })}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

// Status check API
app.get('/api/tiktok/status', (req: Request, res: Response) => {
  res.json({
    status: connectionStatus,
    message: lastStatusMessage,
    username: currentUsername
  });
});

// Connect API
app.post('/api/tiktok/connect', async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  const result = await connectToTikTok(username);
  res.json(result);
});

// Disconnect API
app.post('/api/tiktok/disconnect', (req: Request, res: Response) => {
  cleanupConnection();
  connectionStatus = 'disconnected';
  lastStatusMessage = 'تم فصل الاتصال بالبث يدوياً';
  broadcastEvent('status', { status: connectionStatus, message: lastStatusMessage, username: currentUsername });
  res.json({ success: true, message: lastStatusMessage });
});

// TikFinity / External Webhook endpoint
// Allows streamers using TikFinity, OBS, or webhook relays to forward live events freely!
app.post('/api/tiktok/webhook', (req: Request, res: Response) => {
  const body = req.body || {};
  const event = (body.event || body.type || 'chat').toLowerCase();
  const data = body.data || body;

  if (event.includes('chat') || event.includes('comment')) {
    const username = (data.uniqueId || data.username || data.nickname || 'متابع').replace(/^@/, '');
    const nickname = data.nickname || username;
    const text = data.comment || data.text || '';
    const avatarUrl = data.profilePictureUrl || data.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

    if (text) {
      const commentPayload = {
        id: `comm_${Date.now()}_${Math.random()}`,
        user: {
          id: `u_${username}`,
          username,
          nickname,
          avatarUrl,
          isFollower: Boolean(data.isFollower ?? true),
          taps: 0,
          shares: 0,
          reposts: 0,
          gamePoints: 0
        },
        text: String(text).trim(),
        timestamp: Date.now()
      };
      broadcastEvent('chat', commentPayload);
    }
  } else if (event.includes('gift')) {
    const username = (data.uniqueId || data.username || 'داعم').replace(/^@/, '');
    const nickname = data.nickname || username;
    const avatarUrl = data.profilePictureUrl || data.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
    const rawGiftName = (data.giftName || data.name || 'هدية').toLowerCase();

    let mappedType: 'rose' | 'coin' | 'finger_heart' | 'galaxy' | 'tiktok' = 'rose';
    if (rawGiftName.includes('finger') || rawGiftName.includes('heart')) {
      mappedType = 'finger_heart';
    } else if (rawGiftName.includes('coin') || rawGiftName.includes('عملة')) {
      mappedType = 'coin';
    } else if (rawGiftName.includes('galaxy') || rawGiftName.includes('مجرة')) {
      mappedType = 'galaxy';
    } else if (rawGiftName.includes('tiktok') || rawGiftName.includes('تيك')) {
      mappedType = 'tiktok';
    }

    const giftPayload = {
      id: `gift_${Date.now()}_${Math.random()}`,
      user: {
        id: `u_${username}`,
        username,
        nickname,
        avatarUrl,
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      },
      giftType: mappedType,
      giftName: data.giftName || data.name || 'هدية',
      giftIcon: mappedType === 'rose' ? '🌹' : mappedType === 'finger_heart' ? '🫰' : mappedType === 'coin' ? '🪙' : '🎁',
      repeatCount: Number(data.repeatCount || data.count) || 1,
      timestamp: Date.now()
    };
    broadcastEvent('gift', giftPayload);
  } else if (event.includes('like')) {
    const username = (data.uniqueId || data.username || 'متابع').replace(/^@/, '');
    broadcastEvent('like', {
      username,
      count: Number(data.likeCount || data.count) || 1
    });
  }

  res.json({ success: true, received: event });
});

// Direct test/manual comment ingestion
app.post('/api/tiktok/comment', (req: Request, res: Response) => {
  const { username, text, isFollower } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Comment text required' });
  }

  const cleanUser = (username || 'متابع').replace(/^@/, '');
  const commentPayload = {
    id: `comm_${Date.now()}_${Math.random()}`,
    user: {
      id: `u_${cleanUser}`,
      username: cleanUser,
      nickname: cleanUser,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
      isFollower: Boolean(isFollower !== false),
      taps: 0,
      shares: 0,
      reposts: 0,
      gamePoints: 0
    },
    text: String(text).trim(),
    timestamp: Date.now()
  };

  broadcastEvent('chat', commentPayload);
  res.json({ success: true, comment: commentPayload });
});

// Ingest gift API
app.post('/api/tiktok/gift', (req: Request, res: Response) => {
  const { username, giftType, count } = req.body;
  const cleanUser = (username || 'داعم').replace(/^@/, '');
  const type = giftType || 'rose';

  const giftPayload = {
    id: `gift_${Date.now()}_${Math.random()}`,
    user: {
      id: `u_${cleanUser}`,
      username: cleanUser,
      nickname: cleanUser,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
      isFollower: true,
      taps: 0,
      shares: 0,
      reposts: 0,
      gamePoints: 0
    },
    giftType: type,
    giftName: type === 'rose' ? 'وردة' : type === 'finger_heart' ? 'فنجر هارت' : type === 'coin' ? 'عملة' : 'هدية',
    giftIcon: type === 'rose' ? '🌹' : type === 'finger_heart' ? '🫰' : type === 'coin' ? '🪙' : '🎁',
    repeatCount: Number(count) || 1,
    timestamp: Date.now()
  };

  broadcastEvent('gift', giftPayload);
  res.json({ success: true, gift: giftPayload });
});

// Mount Vite middleware in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Casper Games server running on http://localhost:${PORT}`);
  });
}

startServer();
