import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EncryptionService } from '../../common/encryption/encryption.service';
import { ProvidersRepository } from './repositories/providers.repository';
import { ProviderAdapterFactory } from './adapters/provider-adapter.factory';

type ProviderType = 'OPENAI' | 'ANTHROPIC' | 'GOOGLE';

@Injectable()
export class ProvidersService {
  constructor(
  private readonly providersRepository: ProvidersRepository,
  private readonly encryptionService: EncryptionService,
  private readonly providerAdapterFactory: ProviderAdapterFactory,
) {}

  async create(data: {
    name: string;
    type: ProviderType;
    baseUrl?: string;
    modelName?: string;
    apiKey?: string;
    enabled?: boolean;
    isDefault?: boolean;
  }) {
    const existing = await this.providersRepository.findByName(
      data.name.trim(),
    );

    if (existing) {
      throw new ConflictException('Provider name already exists');
    }

    const encryptedApiKey = data.apiKey
  ? this.encryptionService.encrypt(data.apiKey)
  : undefined;

if (data.isDefault && data.enabled === false) {
  throw new ConflictException(
    'A disabled provider cannot be set as default',
  );
}

const provider = data.isDefault
  ? await this.providersRepository.createAsDefault({
      name: data.name.trim(),
      type: data.type,
      baseUrl: data.baseUrl?.trim(),
      modelName: data.modelName?.trim(),
      encryptedApiKey,
      enabled: data.enabled ?? true,
    })
  : await this.providersRepository.create({
      name: data.name.trim(),
      type: data.type,
      baseUrl: data.baseUrl?.trim(),
      modelName: data.modelName?.trim(),
      encryptedApiKey,
      enabled: data.enabled ?? true,
      isDefault: false,
    });
    return this.toSafeResponse(provider);
  }

  async findAll() {
    const providers = await this.providersRepository.findAll();

    return providers.map((provider) =>
      this.toSafeResponse(provider),
    );
  }

  async findOne(id: string) {
    const provider = await this.providersRepository.findById(id);

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return this.toSafeResponse(provider);
  }

  async update(
    id: string,
    data: {
      name?: string;
      type?: ProviderType;
      baseUrl?: string | null;
      modelName?: string | null;
      apiKey?: string;
      enabled?: boolean;
      isDefault?: boolean;
    },
  ) {
    const existing = await this.providersRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Provider not found');
    }

    if (data.name !== undefined) {
      const normalizedName = data.name.trim();

      if (normalizedName !== existing.name) {
        const duplicate =
          await this.providersRepository.findByName(normalizedName);

        if (duplicate) {
          throw new ConflictException(
            'Provider name already exists',
          );
        }

        data.name = normalizedName;
      }
    }

    if (data.isDefault === true) {
      await this.providersRepository.clearDefault();
    }

    const updateData: {
      name?: string;
      type?: ProviderType;
      baseUrl?: string | null;
      modelName?: string | null;
      encryptedApiKey?: string;
      enabled?: boolean;
      isDefault?: boolean;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    if (data.baseUrl !== undefined) {
      updateData.baseUrl = data.baseUrl?.trim() || null;
    }

    if (data.modelName !== undefined) {
      updateData.modelName = data.modelName?.trim() || null;
    }

    if (data.apiKey !== undefined) {
      updateData.encryptedApiKey =
        this.encryptionService.encrypt(data.apiKey);
    }

    if (data.enabled !== undefined) {
      updateData.enabled = data.enabled;
    }

    if (data.isDefault !== undefined) {
      updateData.isDefault = data.isDefault;
    }

    const provider = await this.providersRepository.update(
      id,
      updateData,
    );

    return this.toSafeResponse(provider);
  }

  async setEnabled(id: string, enabled: boolean) {
  const provider = await this.providersRepository.findById(id);

  if (!provider) {
    throw new NotFoundException('Provider not found');
  }

  const updated = enabled
    ? await this.providersRepository.enable(id)
    : await this.providersRepository.disable(id);

  return this.toSafeResponse(updated);
}



  async getRuntimeProvider(id?: string) {
    const provider = id
      ? await this.providersRepository.findById(id)
      : await this.providersRepository.findDefault();

    if (!provider) {
      throw new NotFoundException(
        id
          ? 'Provider not found'
          : 'No default AI provider is configured',
      );
    }

    if (!provider.enabled) {
      throw new ConflictException(
        'Selected AI provider is disabled',
      );
    }

    return provider;
  }

  async setDefault(id: string) {
  const provider = await this.providersRepository.findById(id);

  if (!provider) {
    throw new NotFoundException('Provider not found');
  }

  if (!provider.enabled) {
    throw new ConflictException(
      'Disabled provider cannot be set as default',
    );
  }

  const updated = await this.providersRepository.setDefault(id);

  return this.toSafeResponse(updated);
}
  async remove(id: string) {
    const existing = await this.providersRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Provider not found');
    }

    await this.providersRepository.delete(id);

    return {
      message: 'Provider deleted successfully',
    };
  }

  async healthCheck(id: string) {
  const provider = await this.providersRepository.findById(id);

  if (!provider) {
    throw new NotFoundException('Provider not found');
  }

  if (!provider.enabled) {
    throw new ConflictException(
      'Disabled provider cannot be health checked',
    );
  }

  if (!provider.encryptedApiKey) {
    return {
      healthy: false,
      provider: provider.type,
      latencyMs: 0,
      message: 'API key is not configured',
    };
  }

  const apiKey = this.encryptionService.decrypt(
    provider.encryptedApiKey,
  );

  const adapter = this.providerAdapterFactory.create(
    provider.type,
    {
      apiKey,
      baseUrl: provider.baseUrl,
      modelName: provider.modelName,
    },
  );

  return adapter.healthCheck();
}


  private toSafeResponse(provider: {
    id: string;
    name: string;
    type: ProviderType;
    baseUrl: string | null;
    modelName: string | null;
    enabled: boolean;
    isDefault: boolean;
    encryptedApiKey: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      baseUrl: provider.baseUrl,
      modelName: provider.modelName,
      enabled: provider.enabled,
      isDefault: provider.isDefault,
      apiKey: provider.encryptedApiKey
        ? this.maskApiKey(provider.encryptedApiKey)
        : null,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }

  private maskApiKey(encryptedApiKey: string) {
    return '****';
  }
}