import { getCustomRepository } from 'typeorm';

import { isEmpty, omit } from 'lodash';
import Market from '../infra/typeorm/entities/Market';
import MarketsRepository from '../infra/typeorm/repositories/MarketsRepository';
import AppError from '../../shared/errors/AppError';

class UpdateMarketService {
  public async execute(
    marketId: string,
    data: Omit<Market, 'id'>,
  ): Promise<Omit<Market, 'internalId'>> {
    const marketsRepository = getCustomRepository(MarketsRepository);

    const market = await marketsRepository.findOne({
      where: { id: marketId },
    });

    if (isEmpty(market)) {
      throw new AppError('Market not found', 404);
    }

    const values = omit(data, ['internalId', 'id', 'creationDate']);

    const updatedMarket = { ...market, ...values };

    const mkt: Market = await marketsRepository.save(updatedMarket);

    return omit(mkt, 'internalId');
  }
}

export default UpdateMarketService;
