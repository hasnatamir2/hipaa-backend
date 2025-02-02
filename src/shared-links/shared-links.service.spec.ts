import { Test, TestingModule } from '@nestjs/testing';
import { SharedLinksService } from './shared-links.service';

describe('SharedLinksService', () => {
  let service: SharedLinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedLinksService],
    }).compile();

    service = module.get<SharedLinksService>(SharedLinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
