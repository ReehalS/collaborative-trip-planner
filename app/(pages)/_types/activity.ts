export interface Activity {
  id: string;
  tripId: string;
  suggesterId: string;
  activityName: string;
  notes?: string;
  city?: string;
  country: string;
  timezone: string;
  startTime: string; // ISO string for dates
  endTime: string; // ISO string for dates
  latitude: number;
  longitude: number;
  address?: string;
  categories: string[];
  website?: string;
  phoneNumber?: string;
  numVotes: number;
  voters: string[];
  avgScore: number;
  createdAt: string; // ISO string
}
