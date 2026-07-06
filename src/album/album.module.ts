import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumEntity } from 'src/card/entities/album.entity';
import { CardEntity } from 'src/card/entities/card.entity';
import { AlbumRepository } from 'src/card/repositories/album.repository';
import { CardRepository } from 'src/card/repositories/card.repository';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';

@Module({
  imports: [TypeOrmModule.forFeature([AlbumEntity, CardEntity])],
  controllers: [AlbumController],
  providers: [AlbumService, AlbumRepository, CardRepository],
})
export class AlbumModule {}
