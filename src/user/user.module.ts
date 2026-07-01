import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { UserCardEntity } from './entities/user-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserCardEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
