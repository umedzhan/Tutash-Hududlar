import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import regionRoutes from './routes/regionRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import monitoringRoutes from './routes/monitoringRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import referenceRoutes from './routes/referenceRoutes.js';
import registrationRequestRoutes from './routes/registrationRequestRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import violationRoutes from './routes/violationRoutes.js';
import restrictedAreaRoutes from './routes/restrictedAreaRoutes.js';
import botRoutes from './routes/botRoutes.js';

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/registration-requests', registrationRequestRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/restricted-areas', restrictedAreaRoutes);
app.use('/api/bot', botRoutes);

app.use((req, res) => res.status(404).json({ message: 'Marshrut topilmadi' }));
app.use(errorHandler);

export default app;
