import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { User } from '../users/entities/user.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Subject } from 'rxjs';

@Injectable()
export class TestimonialsService {
  private events$ = new Subject<{ type: string; data: any }>();

  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getEvents() {
    return this.events$.asObservable();
  }

  async findAll(page = 1, limit = 10): Promise<[Testimonial[], number]> {
    return this.testimonialRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with id ${id} not found`);
    }
    return testimonial;
  }

  async create(dto: CreateTestimonialDto): Promise<Testimonial> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${dto.userId} not found`);
    }

    const testimonial = this.testimonialRepository.create({
      message: dto.message,
      rating: dto.rating,
      user,
    });

    const saved = await this.testimonialRepository.save(testimonial);

    this.events$.next({ type: 'created', data: saved });

    return saved;
  }

  async update(id: string, dto: UpdateTestimonialDto): Promise<Testimonial> {
    const testimonial = await this.findOne(id);

    if (dto.message !== undefined) testimonial.message = dto.message;
    if (dto.rating !== undefined) testimonial.rating = dto.rating;

    if (dto.userId !== undefined) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${dto.userId} not found`);
      }
      testimonial.user = user;
    }

    const updated = await this.testimonialRepository.save(testimonial);

    this.events$.next({ type: 'updated', data: updated });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const testimonial = await this.findOne(id);
    await this.testimonialRepository.remove(testimonial);

    this.events$.next({ type: 'removed', data: { id } });
  }
}
