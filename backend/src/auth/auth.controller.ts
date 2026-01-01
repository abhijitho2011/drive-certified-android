import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // Utilize potentially missing local strategy, so direct call for now or implement LocalStrategy
  @Post('login')
  async login(@Body() req) {
    const user = await this.authService.validateUser(req.email, req.password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body);
  }
}
