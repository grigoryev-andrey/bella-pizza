import { Injectable } from '@nestjs/common';
import { getSession } from 'supertokens-node/recipe/session';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async getUserFromRequest(req: any, res: any): Promise<User | null> {
    try {
      const session = await getSession(req, res);
      const userId = session.getUserId();
      return this.usersService.findOne(userId);
    } catch {
      return null;
    }
  }

  async checkUserRole(userId: string, requiredRole: string): Promise<boolean> {
    const user = await this.usersService.findOne(userId);
    return user?.role === requiredRole;
  }
}
