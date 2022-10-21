import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('renew')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      success: true,
      user,
      email,
      rawHeaders,
    };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.sales)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testPrivateRoute2(@GetUser() user: User) {
    return {
      success: true,
      user,
    };
  }

  @Get('private3')
  @Auth()
  testPrivateRoute3(@GetUser() user: User) {
    return {
      success: true,
      user,
    };
  }
}
