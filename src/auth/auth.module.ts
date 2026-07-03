import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { configService } from 'src/app.config';

@Module({
  imports: [UserModule, JwtModule.register(configService.getJwtConfig())],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
