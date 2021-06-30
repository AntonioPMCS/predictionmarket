import { isEmpty, omit } from 'lodash';
import { EntityRepository, Repository } from 'typeorm';

import Market from '../entities/Market';

@EntityRepository(Market)
class MarketsRepository extends Repository<Market> {
  public async search(marketId: string): Promise<Market | null> {
    const market = await this.findOne({
      where: { id: marketId },
    });

    return market || null;
  }
}

export default MarketsRepository;
