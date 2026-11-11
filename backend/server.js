import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import 'moment/locale/fr.js';
import path from 'path';
import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import candidatureRoutes from './routes/candidatureRoutes.js';
import offreRoutes from './routes/offreRoutes.js';
import entrepriseRoutes from './routes/entrepriseRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

//Load the env variables
dotenv.config();

//connect the database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/candidatures', candidatureRoutes);
app.use('/api/offres', offreRoutes);
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/upload', uploadRoutes);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'frontend', 'public', 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));
app.use('/images', express.static(path.join(__dirname, 'frontend', 'public', 'images')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/public/assets')));
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'public', 'assets')));


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5002;

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode in port ${PORT}`.yellow
      .bold
  );
});
