import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey =
      this.configService.get<string>('ENCRYPTION_KEY');

    if (!encryptionKey) {
      throw new InternalServerErrorException(
        'ENCRYPTION_KEY is not configured',
      );
    }

    const key = Buffer.from(encryptionKey, 'hex');

    if (key.length !== KEY_LENGTH) {
      throw new InternalServerErrorException(
        'ENCRYPTION_KEY must be a 32-byte hexadecimal value',
      );
    }

    this.key = key;
  }

  encrypt(plaintext: string): string {
    if (!plaintext) {
      throw new BadRequestException(
        'Value to encrypt cannot be empty',
      );
    }

    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(
      ALGORITHM,
      this.key,
      iv,
      {
        authTagLength: AUTH_TAG_LENGTH,
      },
    );

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted.toString('hex'),
    ].join(':');
  }

  decrypt(encryptedValue: string): string {
    const parts = encryptedValue.split(':');

    if (parts.length !== 3) {
      throw new InternalServerErrorException(
        'Invalid encrypted value format',
      );
    }

    const [ivHex, authTagHex, encryptedHex] = parts;

    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const decipher = createDecipheriv(
        ALGORITHM,
        this.key,
        iv,
        {
          authTagLength: AUTH_TAG_LENGTH,
        },
      );

      decipher.setAuthTag(authTag);

      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new InternalServerErrorException(
        'Failed to decrypt value',
      );
    }
  }
}