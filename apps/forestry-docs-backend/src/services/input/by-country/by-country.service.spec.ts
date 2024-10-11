import { Test, TestingModule } from '@nestjs/testing';
import { ByCountryService } from './by-country.service';

describe('ByCountryService', () => {
  let service: ByCountryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ByCountryService],
    }).compile();

    service = module.get<ByCountryService>(ByCountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
