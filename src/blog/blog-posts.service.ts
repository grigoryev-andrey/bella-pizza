import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { User } from '../users/entities/user.entity';
import { Subject } from 'rxjs';

@Injectable()
export class BlogPostsService {
  private events$ = new Subject<{ type: string; data: any }>();

  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getEvents() {
    return this.events$.asObservable();
  }

  async findAll(page: number, limit: number): Promise<[BlogPost[], number]> {
    return this.blogPostRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BlogPost> {
    const post = await this.blogPostRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`BlogPost with id ${id} not found`);
    return post;
  }

  async create(dto: CreateBlogPostDto): Promise<BlogPost> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user)
      throw new NotFoundException(`User with id ${dto.userId} not found`);

    const post = this.blogPostRepository.create({
      ...dto,
      user,
    });
    const saved = await this.blogPostRepository.save(post);

    this.events$.next({ type: 'created', data: saved });

    return saved;
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const post = await this.findOne(id);

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.author !== undefined) post.author = dto.author;

    if (dto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${dto.userId} not found`);
      }
      post.user = user;
    }

    const updated = await this.blogPostRepository.save(post);

    this.events$.next({ type: 'updated', data: updated });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.blogPostRepository.remove(post);

    this.events$.next({ type: 'removed', data: { id } });
  }
}
