import express from 'express';
import cors from 'cors';
import { errorHandler } from '../shared/middlewares/ErrorHandling';

import APIsGateway from '../presentation/APIsGateway';

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', APIsGateway);
app.use(errorHandler);

export default app;