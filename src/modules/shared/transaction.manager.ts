import { Injectable } from '@nestjs/common';
import mongoose, { ClientSession } from 'mongoose';

@Injectable()
export class TransactionManager {
  private session: ClientSession;

  async startSession(): Promise<ClientSession> {
    this.session = await mongoose.startSession();
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
