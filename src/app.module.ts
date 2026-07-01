import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BetModule } from './bet/bet.module';
import { CardModule } from './card/card.module';
import { MatchModule } from './match/match.module';
import { PropositionModule } from './proposition/proposition.module';

@Module({
  imports: [UserModule, BetModule, CardModule, MatchModule, PropositionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
