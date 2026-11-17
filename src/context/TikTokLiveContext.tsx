import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, LiveComment, LiveGift, GameId, WinnerCelebration } from '../types';
import { soundEffects } from '../services/soundEffects';

interface TikTokLiveContextType {
  creatorUsername: string;
  setCreatorUsername: (username: string) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  connectionMessage: string;
  connectTikTokAccount: (username: string) => Promise<void>;
  disconnectTikTokAccount: () => Promise<void>;
  
  isFollowerOnly: boolean;
  setIsFollowerOnly: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeGame: GameId;
  setActiveGame: (game: GameId) => void;
  
  // Real-time feeds
  comments: LiveComment[];
  recentGifts: LiveGift[];
  users: Record<string, User>;
  
  // Actions
  addComment: (username: string, text: string, isFollower?: boolean, avatarUrl?: string, nickname?: string) => void;
  addGift: (username: string, giftType: 'rose' | 'coin' | 'finger_heart' | 'galaxy' | 'tiktok', repeatCount?: number, avatarUrl?: string, nickname?: string) => void;
  addTap: (username: string, count?: number) => void;
  addShare: (username: string, count?: number) => void;
  addRepost: (username: string) => void;
  addGamePoints: (username: string, points: number) => void;
  
  // Victory & Hint state
  winnerCelebration: WinnerCelebration | null;
  setWinnerCelebration: (celebration: WinnerCelebration | null) => void;
  hintModalText: string | null;
  setHintModalText: (hint: string | null) => void;
  triggerHint: (hintText: string) => void;
  
  // Simulation control (default disabled per request)
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean | ((prev: boolean) => boolean)) => void;

  // Reset controls (Requirement 5)
  gameResetKey: number;
  resetActiveGame: () => void;
  resetHonorBoardAndVictory: () => void;

  // Signal emitted when VictoryModal "Next Question" is clicked
  victoryNextSignal: number;
  triggerVictoryNext: () => void;
}

const TikTokLiveContext = createContext<TikTokLiveContextType | undefined>(undefined);

// Sample simulated viewer pool for optional manual simulation
const SIMULATED_USERS: Array<{ username: string; nickname: string; avatar: string; isFollower: boolean }> = [
  { username: 'ahmed_gamer', nickname: 'أحمد القيصر 🎮', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ahmed', isFollower: true },
  { username: 'sara_live', nickname: 'سارة لايف ✨', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sara', isFollower: true },
  { username: 'faisal_ksa', nickname: 'فيصل أبو العز 🇸🇦', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=faisal', isFollower: false },
  { username: 'nour_egypt', nickname: 'نور المصرية 🇪🇬', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nour', isFollower: true },
  { username: 'omarking', nickname: 'عمر الملك 👑', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=omar', isFollower: true },
  { username: 'mariam_star', nickname: 'مريم ستار ⭐', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=mariam', isFollower: false },
  { username: 'hamza_sniper', nickname: 'حمزة القناص 🎯', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=hamza', isFollower: true },
  { username: 'reem_vip', nickname: 'ريم البرنسيسة 💎', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=reem', isFollower: true },
];

export const TikTokLiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creatorUsername, setCreatorUsername] = useState<string>('casper_official');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [connectionMessage, setConnectionMessage] = useState<string>('غير متصل بحساب تيك توك');

  const [isFollowerOnly, setIsFollowerOnly] = useState<boolean>(false);
  const [activeGame, setActiveGame] = useState<GameId>('none');

  // Requirement 3: Default simulator state must be FALSE (غير فعال في الوضع الطبيعي)
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);

  // Requirement 5: Reset keys
  const [gameResetKey, setGameResetKey] = useState<number>(0);

  const [comments, setComments] = useState<LiveComment[]>([]);
  const [recentGifts, setRecentGifts] = useState<LiveGift[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});

  const [winnerCelebration, setWinnerCelebration] = useState<WinnerCelebration | null>(null);
  const [hintModalText, setHintModalText] = useState<string | null>(null);
  const [victoryNextSignal, setVictoryNextSignal] = useState<number>(0);

  const getOrCreateUser = useCallback((username: string, isFollower: boolean = true, avatarUrl?: string, nickname?: string): User => {
    return (
      users[username] || {
        id: `usr_${username}`,
        username,
        nickname: nickname || username,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        isFollower,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      }
    );
  }, [users]);

  const addComment = useCallback((username: string, text: string, isFollower: boolean = true, avatarUrl?: string, nickname?: string) => {
    const cleanUser = username.replace(/^@/, '');
    const userObj = getOrCreateUser(cleanUser, isFollower, avatarUrl, nickname);

    setUsers(prev => {
      const existing = prev[cleanUser] || userObj;
      return {
        ...prev,
        [cleanUser]: {
          ...existing,
          nickname: nickname || existing.nickname,
          avatarUrl: avatarUrl || existing.avatarUrl
        }
      };
    });

    const newComment: LiveComment = {
      id: `comm_${Date.now()}_${Math.random()}`,
      user: userObj,
      text: text.trim(),
      timestamp: Date.now()
    };

    setComments(prev => [newComment, ...prev.slice(0, 39)]);
  }, [getOrCreateUser]);

  const addTap = useCallback((username: string, count: number = 1) => {
    const cleanUser = username.replace(/^@/, '');
    setUsers(prev => {
      const u = prev[cleanUser] || {
        id: `usr_${cleanUser}`,
        username: cleanUser,
        nickname: cleanUser,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      };
      return {
        ...prev,
        [cleanUser]: {
          ...u,
          taps: u.taps + count
        }
      };
    });
  }, []);

  const addShare = useCallback((username: string, count: number = 1) => {
    const cleanUser = username.replace(/^@/, '');
    setUsers(prev => {
      const u = prev[cleanUser] || {
        id: `usr_${cleanUser}`,
        username: cleanUser,
        nickname: cleanUser,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      };
      return {
        ...prev,
        [cleanUser]: {
          ...u,
          shares: u.shares + count
        }
      };
    });
  }, []);

  const addRepost = useCallback((username: string) => {
    const cleanUser = username.replace(/^@/, '');
    setUsers(prev => {
      const u = prev[cleanUser] || {
        id: `usr_${cleanUser}`,
        username: cleanUser,
        nickname: cleanUser,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      };
      return {
        ...prev,
        [cleanUser]: {
          ...u,
          reposts: 1 // only counts once
        }
      };
    });
  }, []);

  const addGamePoints = useCallback((username: string, points: number) => {
    const cleanUser = username.replace(/^@/, '');
    setUsers(prev => {
      const u = prev[cleanUser] || {
        id: `usr_${cleanUser}`,
        username: cleanUser,
        nickname: cleanUser,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      };
      return {
        ...prev,
        [cleanUser]: {
          ...u,
          gamePoints: u.gamePoints + points
        }
      };
    });
  }, []);

  const triggerHint = useCallback((hintText: string) => {
    soundEffects.playHint();
    setHintModalText(hintText);
  }, []);

  const addGift = useCallback((
    username: string,
    giftType: 'rose' | 'coin' | 'finger_heart' | 'galaxy' | 'tiktok',
    repeatCount: number = 1,
    avatarUrl?: string,
    nickname?: string
  ) => {
    const cleanUser = username.replace(/^@/, '');
    const userObj = getOrCreateUser(cleanUser, true, avatarUrl, nickname);

    let giftName = 'هدية';
    let giftIcon = '🎁';
    if (giftType === 'rose') {
      giftName = 'وردة';
      giftIcon = '🌹';
    } else if (giftType === 'coin') {
      giftName = 'عملة';
      giftIcon = '🪙';
    } else if (giftType === 'finger_heart') {
      giftName = 'فنجر هارت';
      giftIcon = '🫰';
    } else if (giftType === 'galaxy') {
      giftName = 'مجرة';
      giftIcon = '🌌';
    } else if (giftType === 'tiktok') {
      giftName = 'شعار تيك توك';
      giftIcon = '🎵';
    }

    const newGift: LiveGift = {
      id: `gift_${Date.now()}_${Math.random()}`,
      user: userObj,
      giftType,
      giftName,
      giftIcon,
      repeatCount,
      timestamp: Date.now()
    };

    setRecentGifts(prev => [newGift, ...prev.slice(0, 19)]);
  }, [getOrCreateUser]);

  // Requirement 5: Reset active game back to beginning
  const resetActiveGame = useCallback(() => {
    soundEffects.playClick();
    setGameResetKey(prev => prev + 1);
    setWinnerCelebration(null);
    setHintModalText(null);
  }, []);

  // Requirement 5: Reset honor board and victory board
  const resetHonorBoardAndVictory = useCallback(() => {
    soundEffects.playClick();
    setUsers({});
    setWinnerCelebration(null);
    setComments([]);
    setRecentGifts([]);
  }, []);

  const triggerVictoryNext = useCallback(() => {
    setWinnerCelebration(null);
    setVictoryNextSignal(prev => prev + 1);
  }, []);

  // Real-time EventSource connection to backend live stream
  useEffect(() => {
    const eventSource = new EventSource('/api/tiktok/stream');

    eventSource.addEventListener('status', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status) {
          setConnectionStatus(data.status);
          setIsConnected(data.status === 'connected');
        }
        if (data.message) {
          setConnectionMessage(data.message);
        }
      } catch {
        // ignore
      }
    });

    eventSource.addEventListener('chat', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.user && data.text) {
          addComment(
            data.user.username,
            data.text,
            data.user.isFollower,
            data.user.avatarUrl,
            data.user.nickname
          );
        }
      } catch {
        // ignore
      }
    });

    eventSource.addEventListener('gift', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.user && data.giftType) {
          addGift(
            data.user.username,
            data.giftType,
            data.repeatCount || 1,
            data.user.avatarUrl,
            data.user.nickname
          );
        }
      } catch {
        // ignore
      }
    });

    eventSource.addEventListener('like', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.username) {
          addTap(data.username, data.count || 1);
        }
      } catch {
        // ignore
      }
    });

    eventSource.addEventListener('share', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.username) {
          addShare(data.username, data.count || 1);
        }
      } catch {
        // ignore
      }
    });

    eventSource.onerror = () => {
      // Keep alive; browser auto-reconnects
    };

    return () => {
      eventSource.close();
    };
  }, [addComment, addGift, addTap, addShare]);

  // Connect to TikTok account via backend API
  const connectTikTokAccount = useCallback(async (username: string) => {
    const cleanUser = username.trim().replace(/^@/, '');
    setCreatorUsername(cleanUser);
    setConnectionStatus('connecting');
    setConnectionMessage(`جاري الاتصال بحساب @${cleanUser}...`);

    try {
      const res = await fetch('/api/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser })
      });
      const result = await res.json();
      if (result.success) {
        setIsConnected(true);
        setConnectionStatus('connected');
        setConnectionMessage(result.message);
      } else {
        setIsConnected(false);
        setConnectionStatus('error');
        setConnectionMessage(result.message || 'تعذر الاتصال بالحساب');
      }
    } catch (err: any) {
      setIsConnected(false);
      setConnectionStatus('error');
      setConnectionMessage(`خطأ في الاتصال: ${err.message || 'فشل الاتصال بالخادم'}`);
    }
  }, []);

  // Disconnect from TikTok account via backend API
  const disconnectTikTokAccount = useCallback(async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' });
    } catch {
      // ignore
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setConnectionMessage('تم قطع الاتصال بالبث');
  }, []);

  // Check initial connection status on load
  useEffect(() => {
    fetch('/api/tiktok/status')
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setConnectionStatus(data.status);
          setIsConnected(data.status === 'connected');
        }
        if (data.message) {
          setConnectionMessage(data.message);
        }
        if (data.username) {
          setCreatorUsername(data.username);
        }
      })
      .catch(() => {});
  }, []);

  // Simulation loop (only active if user explicitly turns it on!)
  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(() => {
      const randUser = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
      const dice = Math.random();

      if (dice < 0.65) {
        addTap(randUser.username, Math.floor(Math.random() * 8) + 1);
      } else if (dice < 0.80) {
        let commentText = 'عاش يا شباب 👏🔥';
        if (activeGame === 'tug_of_war') {
          commentText = Math.random() > 0.5 ? 'y' : 'r';
        } else if (activeGame === 'country_battle') {
          const countries = ['مصر', 'السعودية', 'الامارات', 'الاردن', 'العراق', 'المغرب', 'فلسطين'];
          commentText = countries[Math.floor(Math.random() * countries.length)];
        } else if (activeGame === 'clash_arena') {
          commentText = Math.random() > 0.5 ? '1' : '2';
        } else if (activeGame === 'printer') {
          commentText = 't';
        } else if (activeGame === 'memory_cards') {
          const c1 = Math.floor(Math.random() * 16) + 1;
          const c2 = Math.floor(Math.random() * 16) + 1;
          commentText = `${c1} ${c2}`;
        }
        addComment(randUser.username, commentText, randUser.isFollower, randUser.avatar, randUser.nickname);
      } else if (dice < 0.90) {
        addShare(randUser.username, 1);
      } else {
        const giftChoices: Array<'rose' | 'coin' | 'finger_heart'> = ['rose', 'coin', 'finger_heart'];
        const chosen = giftChoices[Math.floor(Math.random() * giftChoices.length)];
        addGift(randUser.username, chosen, 1, randUser.avatar, randUser.nickname);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [isSimulationActive, activeGame, addTap, addComment, addShare, addGift]);

  const value = useMemo(() => ({
    creatorUsername,
    setCreatorUsername,
    isConnected,
    setIsConnected,
    connectionStatus,
    connectionMessage,
    connectTikTokAccount,
    disconnectTikTokAccount,
    isFollowerOnly,
    setIsFollowerOnly,
    activeGame,
    setActiveGame,
    comments,
    recentGifts,
    users,
    addComment,
    addGift,
    addTap,
    addShare,
    addRepost,
    addGamePoints,
    winnerCelebration,
    setWinnerCelebration,
    hintModalText,
    setHintModalText,
    triggerHint,
    isSimulationActive,
    setIsSimulationActive,
    gameResetKey,
    resetActiveGame,
    resetHonorBoardAndVictory,
    victoryNextSignal,
    triggerVictoryNext
  }), [
    creatorUsername,
    isConnected,
    connectionStatus,
    connectionMessage,
    connectTikTokAccount,
    disconnectTikTokAccount,
    isFollowerOnly,
    activeGame,
    comments,
    recentGifts,
    users,
    addComment,
    addGift,
    addTap,
    addShare,
    addRepost,
    addGamePoints,
    winnerCelebration,
    hintModalText,
    triggerHint,
    isSimulationActive,
    gameResetKey,
    resetActiveGame,
    resetHonorBoardAndVictory,
    victoryNextSignal,
    triggerVictoryNext
  ]);

  return (
    <TikTokLiveContext.Provider value={value}>
      {children}
    </TikTokLiveContext.Provider>
  );
};

export const useTikTokLive = () => {
  const context = useContext(TikTokLiveContext);
  if (!context) {
    throw new Error('useTikTokLive must be used within a TikTokLiveProvider');
  }
  return context;
};
