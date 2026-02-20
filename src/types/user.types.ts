import { Timestamp } from 'firebase/firestore';

export interface UserStats {
  outfitCount: number;
  totalRatingsReceived: number;
  averageRatingReceived: number;
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  stats: UserStats;
}
