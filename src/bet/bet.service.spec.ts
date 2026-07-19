import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BetService } from './bet.service';
import { BetEntity } from './entities/bet.entity';
import { PropositionEntity } from '../proposition/entities/proposition.entity';
import { SolanaService } from '../solana/solana.service';
import { UserEntity } from '../user/entities/user.entity';

describe('BetService', () => {
  let service: BetService;
  let betRepository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let propositionRepository: { findOne: jest.Mock };
  let solanaService: { verifyPlaceBetTx: jest.Mock };

  const user = {
    id: 'user-1',
    walletAddress: 'WalletAddress111',
  } as UserEntity;
  const openProposition = {
    id: 'prop-1',
    status: 'open',
    marketAddress: 'MarketAddress111',
    oddsYes: 2,
    oddsNo: 1.5,
  } as PropositionEntity;

  beforeEach(async () => {
    betRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data: Partial<BetEntity>) => data),
      save: jest.fn((data) => Promise.resolve(data)),
    };
    propositionRepository = {
      findOne: jest.fn().mockResolvedValue(openProposition),
    };
    solanaService = {
      verifyPlaceBetTx: jest.fn().mockResolvedValue({
        side: 1, // YES
        amount: 1 * LAMPORTS_PER_SOL,
        fee: 0.02 * LAMPORTS_PER_SOL,
        positionAddress: 'PositionAddress111',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BetService,
        { provide: getRepositoryToken(BetEntity), useValue: betRepository },
        {
          provide: getRepositoryToken(PropositionEntity),
          useValue: propositionRepository,
        },
        { provide: SolanaService, useValue: solanaService },
      ],
    }).compile();

    service = module.get<BetService>(BetService);
  });

  it('records a bet from a verified on-chain place_bet tx', async () => {
    const result = await service.createBet(user, {
      propositionId: 'prop-1',
      pick: true,
      txSignature: 'sig-1',
    });

    expect(solanaService.verifyPlaceBetTx).toHaveBeenCalledWith('sig-1', {
      marketAddress: openProposition.marketAddress,
      expectedUserWallet: user.walletAddress,
    });
    expect(result.data.bet.stake).toBe(1);
    expect(result.data.bet.potentialWin).toBeCloseTo(2, 4);
    expect(result.data.bet.positionAddress).toBe('PositionAddress111');
    expect(betRepository.save).toHaveBeenCalled();
  });

  it('rejects when the on-chain side does not match the requested pick', async () => {
    solanaService.verifyPlaceBetTx.mockResolvedValue({
      side: 0, // NO
      amount: 1 * LAMPORTS_PER_SOL,
      fee: 0,
      positionAddress: 'PositionAddress111',
    });

    await expect(
      service.createBet(user, {
        propositionId: 'prop-1',
        pick: true,
        txSignature: 'sig-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a transaction signature that was already recorded', async () => {
    betRepository.findOne.mockResolvedValue({ id: 'existing-bet' });

    await expect(
      service.createBet(user, {
        propositionId: 'prop-1',
        pick: true,
        txSignature: 'sig-1',
      }),
    ).rejects.toThrow(ConflictException);
    expect(solanaService.verifyPlaceBetTx).not.toHaveBeenCalled();
  });

  it('rejects propositions with no on-chain market', async () => {
    propositionRepository.findOne.mockResolvedValue({
      ...openProposition,
      marketAddress: null,
    });

    await expect(
      service.createBet(user, {
        propositionId: 'prop-1',
        pick: true,
        txSignature: 'sig-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects propositions that are no longer open', async () => {
    propositionRepository.findOne.mockResolvedValue({
      ...openProposition,
      status: 'resolved',
    });

    await expect(
      service.createBet(user, {
        propositionId: 'prop-1',
        pick: true,
        txSignature: 'sig-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
