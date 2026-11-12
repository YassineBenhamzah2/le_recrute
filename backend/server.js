import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import 'moment/locale/fr.js';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import candidatureRoutes from './routes/candidatureRoutes.js';
import offreRoutes from './routes/offreRoutes.js';
import entrepriseRoutes from './routes/entrepriseRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

//Load the env variables
dotenv.config();
dotenv.config({ path: path.resolve('backend', '.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'albaridbank_recrutement_secret_key_2026_xyz123!';
}

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

// Configuration avancée pour servir les fichiers téléversés (PDF & Images) avec affichage inline
const staticUploadOptions = {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    const lower = filePath.toLowerCase();
    if (lower.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + path.basename(filePath) + '"');
    } else if (lower.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline');
    } else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', 'inline');
    }
  },
};

app.use('/uploads', express.static(path.join(__dirname, '/uploads'), staticUploadOptions));
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads'), staticUploadOptions));
app.use('/uploads', express.static(path.join(__dirname, 'frontend', 'public', 'uploads'), staticUploadOptions));
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));
app.use('/images', express.static(path.join(__dirname, 'frontend', 'public', 'images')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/public/assets')));
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'public', 'assets')));


const frontendBuild = path.join(__dirname, 'frontend', 'build', 'index.html');
const frontendBuildAlt = path.join(__dirname, '../frontend/build', 'index.html');

if (process.env.NODE_ENV === 'production' && (fs.existsSync(frontendBuild) || fs.existsSync(frontendBuildAlt))) {
  const buildDir = fs.existsSync(frontendBuild) ? path.join(__dirname, 'frontend', 'build') : path.join(__dirname, '../frontend', 'build');
  app.use(express.static(buildDir));
  app.get('*', (req, res) =>
    res.sendFile(path.join(buildDir, 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'API Recrutement is running....' });
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
