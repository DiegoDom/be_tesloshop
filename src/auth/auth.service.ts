import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginDto } from './dto';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; jwt: string }> {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      delete user.password;

      //? Retornar el JWT
      const jwt = this.getJwtToken({ uid: user.id });

      return { user, jwt };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: User; jwt: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        'There is not records with this credentials',
      );
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException(
        'There is not records with this credentials',
      );
    }

    //? Retornar el JWT
    const jwt = this.getJwtToken({ uid: user.id });

    return {
      user,
      jwt,
    };
  }

  checkAuthStatus(user: User) {
    return { user, jwt: this.getJwtToken({ uid: user.id }) };
  }

  private getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  private handleExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected server error, report to admin',
    );
  }
}
