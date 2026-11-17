export type GameId = 
  | 'none'
  | 'scrambled_letters'
  | 'guessing'
  | 'write_things'
  | 'roulette'
  | 'proverbs'
  | 'iq_game'
  | 'country_battle'
  | 'tug_of_war'
  | 'printer'
  | 'clash_arena'
  | 'memory_cards'
  | 'grand_challenge';

export interface User {
  id: string;
  username: string;
  nickname: string;
  avatarUrl: string;
  isFollower: boolean;
  taps: number;
  shares: number;
  reposts: number;
  gamePoints: number;
}

export interface LiveComment {
  id: string;
  user: User;
  text: string;
  timestamp: number;
}

export interface LiveGift {
  id: string;
  user: User;
  giftType: 'rose' | 'coin' | 'finger_heart' | 'galaxy' | 'tiktok';
  giftName: string;
  giftIcon: string;
  repeatCount: number;
  timestamp: number;
}

export interface QuestionItem {
  id: number;
  question: string;
  answer: string;
  hint?: string;
  extraAnswers?: string[]; // Alternative spellings
  items?: string[]; // For "write 10 things"
}

export interface WinnerCelebration {
  winner: User;
  gameTitle: string;
  questionText: string;
  correctAnswer: string;
  isGiftAnswer?: boolean;
}

export type ThemeBackground = 'cyber' | 'space' | 'arena' | 'violet' | 'midnight';
