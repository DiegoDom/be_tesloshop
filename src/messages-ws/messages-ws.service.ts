import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';

import { User } from '../auth/entities/user.entity';

interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, uid: string) {
    const user = await this.userRepository.findOneBy({ id: uid });

    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');

    this.checkUserConnection(user.id);

    this.connectedClients[client.id] = {
      socket: client,
      user,
    };
  }

  removeClient(cliente: Socket) {
    delete this.connectedClients[cliente.id];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  getUserFullNameBySocketID(id: string): string {
    return this.connectedClients[id].user.fullName;
  }

  private checkUserConnection(uid: string) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const { user, socket } = this.connectedClients[clientId];
      if (user.id === uid) {
        socket.disconnect();
        break;
      }
    }
  }
}
