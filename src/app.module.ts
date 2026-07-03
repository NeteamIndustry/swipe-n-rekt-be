import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BetModule } from './bet/bet.module';
import { CardModule } from './card/card.module';
import { MatchModule } from './match/match.module';
import { PropositionModule } from './proposition/proposition.module';
import { AuthModule } from './auth/auth.module';
import { AlbumModule } from './album/album.module';
import { configService } from './app.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UserModule,
    BetModule,
    CardModule,
    MatchModule,
    PropositionModule,
    AuthModule,
    AlbumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
