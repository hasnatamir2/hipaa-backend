import { Test, TestingModule } from '@nestjs/testing';
import { SharedLinksController } from './shared-links.controller';

describe('SharedLinksController', () => {
  let controller: SharedLinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharedLinksController],
    }).compile();

    controller = module.get<SharedLinksController>(SharedLinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
