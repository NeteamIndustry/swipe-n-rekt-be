import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { PropositionService } from './proposition.service';
import { PropositionRepository } from './repositories/proposition.repository';
import { BetEntity } from '../bet/entities/bet.entity';
import { SolanaService } from '../solana/solana.service';
import { SIDE_YES } from '../solana/solana.constants';

describe('PropositionService.settleProposition', () => {
  let service: PropositionService;
  let propositionRepository: { findOne: jest.Mock; save: jest.Mock };
  let betRepository: { find: jest.Mock; update: jest.Mock };
  let solanaService: { settleMarketMock: jest.Mock };

  const openMarketProposition = {
    id: 'prop-1',
    status: 'open',
    marketAddress: 'MarketAddress111',
  };

  beforeEach(async () => {
    propositionRepository = {
      findOne: jest.fn().mockResolvedValue({ ...openMarketProposition }),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    betRepository = {
      find: jest.fn().mockResolvedValue([
        { id: 'bet-yes', pick: true, status: 'active' },
        { id: 'bet-no', pick: false, status: 'active' },
      ]),
      update: jest.fn().mockResolvedValue(undefined),
    };
    solanaService = {
      settleMarketMock: jest.fn().mockResolvedValue('settle-tx-sig'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropositionService,
        { provide: PropositionRepository, useValue: propositionRepository },
        { provide: getRepositoryToken(BetEntity), useValue: betRepository },
        { provide: SolanaService, useValue: solanaService },
      ],
    }).compile();

    service = module.get<PropositionService>(PropositionService);
  });

  it('settles on-chain and flips bet statuses to won/lost by pick', async () => {
    const result = await service.settleProposition('prop-1', true);

    expect(solanaService.settleMarketMock).toHaveBeenCalledWith(
      openMarketProposition.marketAddress,
      SIDE_YES,
    );
    expect(result.data.status).toBe('resolved');
    expect(result.data.outcome).toBe(true);
    expect(betRepository.update).toHaveBeenCalledWith('bet-yes', {
      status: 'won',
    });
    expect(betRepository.update).toHaveBeenCalledWith('bet-no', {
      status: 'lost',
    });
  });

  it('rejects settling a proposition with no on-chain market', async () => {
    propositionRepository.findOne.mockResolvedValue({
      ...openMarketProposition,
      marketAddress: null,
    });

    await expect(service.settleProposition('prop-1', true)).rejects.toThrow(
      BadRequestException,
    );
    expect(solanaService.settleMarketMock).not.toHaveBeenCalled();
  });

  it('rejects settling an already-resolved proposition', async () => {
    propositionRepository.findOne.mockResolvedValue({
      ...openMarketProposition,
      status: 'resolved',
    });

    await expect(service.settleProposition('prop-1', true)).rejects.toThrow(
      BadRequestException,
    );
    expect(solanaService.settleMarketMock).not.toHaveBeenCalled();
  });
});
