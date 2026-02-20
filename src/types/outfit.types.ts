import { Timestamp } from 'firebase/firestore';

export interface Outfit {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl: string | null;
  imageUrl: string;
  storagePath: string;
  caption: string;
  tags: string[];
  createdAt: Timestamp;
  ratingCount: number;
  averageRating: number;
  commentCount: number;
  aiSuggestionGeneratedAt: Timestamp | null;
}

export interface Rating {
  userId: string;
  value: number; // 1-5
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl: string | null;
  text: string;
  createdAt: Timestamp;
}

export interface AISuggestion {
  outfitId: string;
  userId: string;
  suggestion: string;
  promptSnapshot: string;
  generatedAt: Timestamp;
  modelVersion: string;
  ratingCountAtGeneration: number;
  averageRatingAtGeneration: number;
}
