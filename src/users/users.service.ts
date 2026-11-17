import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Subject } from 'rxjs';

@Injectable()
export class UsersService {
  private events$ = new Subject<{ type: string; data: any }>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getEvents() {
    return this.events$.asObservable();
  }

  async findAll(page = 1, limit = 10): Promise<[User[], number]> {
    return this.userRepository.findAndCount({
      relations: ['testimonial', 'blogPosts', 'cart', 'orders'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['testimonial', 'blogPosts', 'cart', 'orders'],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['testimonial', 'blogPosts', 'cart', 'orders'],
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new UnauthorizedException(
        'Пользователь с таким email уже существует',
      );
    }
    const user = this.userRepository.create(dto);
    const saved = await this.userRepository.save(user);

    this.events$.next({ type: 'created', data: saved });

    return saved;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.role !== undefined) user.role = dto.role;

    const updated = await this.userRepository.save(user);

    this.events$.next({ type: 'updated', data: updated });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);

    this.events$.next({ type: 'removed', data: { id } });
  }
}
