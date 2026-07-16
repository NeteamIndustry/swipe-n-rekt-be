import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumEntity } from 'src/card/entities/album.entity';
import { CardEntity } from 'src/card/entities/card.entity';
import { AlbumRepository } from 'src/card/repositories/album.repository';
import { CardRepository } from 'src/card/repositories/card.repository';
import { UserCardEntity } from 'src/user/entities/user-card.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { SetRewardClaimEntity } from './entities/set-reward-claim.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AlbumEntity,
      CardEntity,
      UserCardEntity,
      UserEntity,
      SetRewardClaimEntity,
    ]),
  ],
  controllers: [AlbumController],
  providers: [AlbumService, AlbumRepository, CardRepository, JwtAuthGuard],
})
export class AlbumModule {}
