import { getCustomRepository } from 'typeorm';

import { isEmpty, omit } from 'lodash';
import MarketsRepository from '../infra/typeorm/repositories/MarketsRepository';
import AppError from '../../shared/errors/AppError';

class DeleteMarketService {
  public async execute(marketId: string): Promise<void> {
    const marketsRepository = getCustomRepository(MarketsRepository);

    const market: any = await marketsRepository.findOne({
      where: { id: marketId },
    });

    if (isEmpty(market)) {
      throw new AppError('Market not found', 404);
    }

    await marketsRepository.remove(market);
  }
}

export default DeleteMarketService;
