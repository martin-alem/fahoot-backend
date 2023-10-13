import { Events } from '../utils/constant';

export interface IEventData {
  event: Events;
  data: unknown;
  recipient: string | null;
  room: string | null;
  timestamp: string;
  namespace: string;
}
