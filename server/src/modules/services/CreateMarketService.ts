import { getCustomRepository } from 'typeorm';
import moment from 'moment';
import { isEmpty, omit } from 'lodash';
import Market from '../infra/typeorm/entities/Market';
import MarketsRepository from '../infra/typeorm/repositories/MarketsRepository';
import AppError from '../../shared/errors/AppError';
import { MARKET_STATES } from '../../shared/utils/enums';

class CreateMarketService {
  public async execute(
    data: Omit<Market, 'creationDate' | 'internalId'>,
  ): Promise<Omit<Market, 'internalId'>> {
    const marketsRepository = getCustomRepository(MarketsRepository);

    const duplicatedMarket = await marketsRepository.search(data.id);

    if (!isEmpty(duplicatedMarket)) {
      throw new AppError('There is already a market saved with this Id');
    }

    if (!!data.state && !(data.state in MARKET_STATES)) {
      throw new AppError('State not valid');
    }

    const creationDate = moment().utc(false);

    const mkt = {
      ...data,
      creationDate,
      state: data.state || MARKET_STATES.OPEN,
    };

    const market = await marketsRepository.create(mkt);

    await marketsRepository.save(market);

    return omit(market, 'internalId');
  }
}

export default CreateMarketService;
