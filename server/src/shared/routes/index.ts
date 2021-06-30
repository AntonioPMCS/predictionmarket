import { Router } from 'express';

import marketsRouters from './markets.routes';

const routes = Router();

routes.use('/markets', marketsRouters);

export default routes;
