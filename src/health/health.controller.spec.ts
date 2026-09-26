import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return healthy status', () => {
    const result = controller.health();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('echogpt-api');
    expect(result.timestamp).toBeDefined();
  });

  it('should return ready status', () => {
    const result = controller.readiness();

    expect(result.status).toBe('ready');
    expect(result.service).toBe('echogpt-api');
    expect(result.timestamp).toBeDefined();
  });
});