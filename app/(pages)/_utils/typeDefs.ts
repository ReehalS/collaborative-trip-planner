export interface UserToTrip {
  id: string;
  userId: string;
  tripId: string;
  role: string;
}

export interface UserToActivity {
  id: string;
  userId: string;
  activityId: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  profilePic?: number;
}

export interface Trip {
  id: string;
  userIds: string[];
  joinCode: string;
  activities?: ActivityToTrip[];
  country: string;
  city?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  users?: UserToTrip[];
  activityCount?: number;
  memberCount?: number;
}

export interface ActivityToTrip {
  id: string;
  activityId: string;
  tripId: string;
}

export interface Activity {
  id: string;
  tripId: string;
  suggesterId: string;
  activityName: string;
  notes?: string;
  city?: string;
  country: string;
  timezone: string;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  address?: string;
  categories: string[];
  website?: string;
  phoneNumber?: string;
  numVotes: number;
  votes: string[];
  avgScore: number;
  createdAt: string;
}
