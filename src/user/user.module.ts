import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { UserCardEntity } from './entities/user-card.entity';
import { UserPackEntity } from './entities/user-pack.entity';
import { CardEntity } from '../card/entities/card.entity';
import { UserRepository } from './repositories/user.repository';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserCardEntity,
      UserPackEntity,
      CardEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtAuthGuard],
  exports: [UserRepository],
})
export class UserModule {}
