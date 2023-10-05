import { Events } from 'src/utils/constant';

export class EventData {
  private readonly event: Events;
  private readonly data: unknown;
  private readonly recipient: string | null;
  private readonly room: string | null;
  private readonly timestamp: string;
  private readonly namespace: string;

  constructor(event: Events, data: unknown, namespace: string, recipient: string | null, room: string | null) {
    this.event = event;
    this.data = data;
    this.room = room;
    this.namespace = namespace;
    this.recipient = recipient;
    this.timestamp = new Date().toUTCString();
  }
}
