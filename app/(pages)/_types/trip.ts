import { ActivityToTrip, UserToTrip } from './index';

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
}
