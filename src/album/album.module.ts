import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumEntity } from 'src/card/entities/album.entity';
import { AlbumRepository } from 'src/card/repositories/album.repository';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';

@Module({
  imports: [TypeOrmModule.forFeature([AlbumEntity])],
  controllers: [AlbumController],
  providers: [AlbumService, AlbumRepository],
})
export class AlbumModule {}
