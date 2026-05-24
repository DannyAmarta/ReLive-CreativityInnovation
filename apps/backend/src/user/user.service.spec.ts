import * as crypto from 'crypto';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

describe('UserService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    trainerProfile: {
      upsert: jest.fn(),
    },
    fiatWallet: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const eventEmitter = {
    emit: jest.fn(),
  };

  const configService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  };

  const service = new UserService(
    prisma as any,
    jwtService as any,
    eventEmitter as any,
    configService as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockReturnValue(undefined);
    configService.getOrThrow.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'test-secret';
      }

      throw new Error(`Unexpected key ${key}`);
    });
    (fs.readFileSync as jest.Mock).mockReturnValue('<html>{{code}}</html>');
  });

  afterEach(() => {
    (fs.readFileSync as jest.Mock).mockReset();
  });

  it('creates an account deletion code, signs a verification token, and emits an email event', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 7, email: 'user@example.com' });
    jwtService.signAsync.mockResolvedValue('verify-token');
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const result = await service.requestAccountDeletionCode(7);

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: 'account_deletion',
        sub: 7,
        codeHash: crypto
          .createHmac('sha256', 'test-secret')
          .update('100000')
          .digest('hex'),
      }),
      expect.objectContaining({
        expiresIn: '10m',
      }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'user.delete-request',
      expect.objectContaining({
        email: 'user@example.com',
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        verifyToken: 'verify-token',
      }),
    );
  });

  it('deletes the user when the submitted deletion code matches the signed hash', async () => {
    const codeHash = crypto
      .createHmac('sha256', 'test-secret')
      .update('654321')
      .digest('hex');

    jwtService.verifyAsync.mockResolvedValue({
      purpose: 'account_deletion',
      sub: 11,
      codeHash,
    });
    prisma.user.delete.mockResolvedValue({ id: 11 });

    const result = await service.confirmAccountDeletion(
      11,
      'signed-token',
      '654321',
    );

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 11 },
    });
    expect(result).toEqual({
      success: true,
      message: 'Account deleted successfully.',
    });
  });

  it('rejects an invalid deletion code without deleting the account', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      purpose: 'account_deletion',
      sub: 11,
      codeHash: 'different',
    });

    await expect(
      service.confirmAccountDeletion(11, 'signed-token', '123456'),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });
});
