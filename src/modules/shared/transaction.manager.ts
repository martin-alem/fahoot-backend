import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';

@Injectable()
export class TransactionManager {
  private session: ClientSession;
  private readonly connection: Connection;

  constructor(@InjectConnection(DEFAULT_DATABASE_CONNECTION) connection: Connection) {
    this.connection = connection;
  }
  async startSession(): Promise<ClientSession> {
    this.session = await this.connection.startSession();
    return this.session;
  }
  async startTransaction(): Promise<void> {
    this.session.startTransaction();
  }

  async commitTransaction(): Promise<void> {
    await this.session.commitTransaction();
  }

  async endSession(): Promise<void> {
    await this.session.endSession();
  }

  async abortTransaction(): Promise<void> {
    await this.session.abortTransaction();
  }

  getSession(): ClientSession {
    return this.session;
  }
}
