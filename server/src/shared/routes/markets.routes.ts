import { Router } from 'express';
import { isEmpty, omit } from 'lodash';
import { getCustomRepository } from 'typeorm';
import { celebrate, Joi, Segments } from 'celebrate';

import { classToClass } from 'class-transformer';

import DeleteMarketService from '../../modules/services/DeleteMarketService';
import Market from '../../modules/infra/typeorm/entities/Market';
import UpdateMarketService from '../../modules/services/UpdateMarketService';
import CreateMarketService from '../../modules/services/CreateMarketService';
import MarketsRepository from '../../modules/infra/typeorm/repositories/MarketsRepository';

import AppError from '../errors/AppError';

const marketsRouters = Router();

marketsRouters.get('/', async (request, response) => {
  const marketsRepository = getCustomRepository(MarketsRepository);
  const markets = await marketsRepository.find();

  if (isEmpty(markets)) {
    return response.status(204).json({ data: [] });
  }

  return response.json({ data: classToClass(markets) });
});

marketsRouters.get('/:marketId', async (request, response) => {
  const { marketId } = request.params;
  const marketsRepository = getCustomRepository(MarketsRepository);
  const market = await marketsRepository.search(marketId);

  if (isEmpty(market)) {
    throw new AppError('Market not found', 404);
  }

  return response.json({ data: classToClass(market) });
});

marketsRouters.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      id: Joi.string().required(),
      title: Joi.string().required(),
      state: Joi.string(),
      endDate: Joi.date().required(),
      resolutionSource: Joi.string().required(),
      description: Joi.string().required(),
      marketMakerAddress: Joi.string().required(),
      yesPositionID: Joi.string().required(),
      noPositionID: Joi.string().required(),
      questionId: Joi.string().required(),
      oracle: Joi.string().required(),
      tradeVolume: Joi.number(),
    },
  }),
  async (request, response) => {
    const data: Omit<Market, 'creationDate'> = request.body;

    const createMarketService = new CreateMarketService();
    const responseData = await createMarketService.execute(data);

    return response.status(201).json(responseData);
  },
);

marketsRouters.put('/:marketId', async (request, response) => {
  const { marketId } = request.params;

  const data: Market = request.body;

  const updateMarketService = new UpdateMarketService();
  const responseData = await updateMarketService.execute(marketId, data);

  return response.status(200).json(responseData);
});

marketsRouters.delete('/:marketId', async (request, response) => {
  const { marketId } = request.params;

  const data: Market = request.body;

  const deleteMarketService = new DeleteMarketService();
  const responseData = await deleteMarketService.execute(marketId);

  return response.status(200).json(responseData);
});

export default marketsRouters;
