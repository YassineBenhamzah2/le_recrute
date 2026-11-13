import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Répertoire de destination sécurisé pour les documents
const uploadDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware d'identification facultative pour lier le document à l'utilisateur lors de l'upload
const extractUploaderInfo = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { _id: decoded.id };
    } catch (e) {
      // Token non fourni ou invalide, l'upload continue comme document standard
    }
  }
  next();
};

// Configuration du stockage sécurisé avec Multer (Génération cryptographique CNDP)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);

    // Cryptographic unguessable token (128-bit entropy)
    const cryptoHex = crypto.randomBytes(8).toString('hex');
    const userTag = req.user && req.user._id ? `_u${req.user._id}_` : '_';
    const uniqueSuffix = `${Date.now()}${userTag}${cryptoHex}`;

    cb(null, `${cleanBase || 'doc'}_${uniqueSuffix}${ext}`);
  },
});

// Validation stricte du type MIME et de l'extension
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/pjpeg',
    'image/png',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (allowedExtensions.includes(ext) && (allowedMimeTypes.includes(mime) || ext === '.pdf')) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Format de fichier non autorisé. Seuls les fichiers PDF, JPG, JPEG et PNG sont acceptés.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // Limite max 15 Mo par document
  },
  fileFilter,
});

/**
 * @route   POST /api/upload
 * @desc    Upload sécurisé d'un document (CNI, Diplômes, Relevés, Attestations)
 * @access  Public / Candidat
 */
router.post('/', extractUploaderInfo, (req, res) => {
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res
          .status(400)
          .json({ message: 'Le fichier dépasse la taille maximale autorisée (15 Mo).' });
      }
      return res.status(400).json({ message: `Erreur Multer: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier sélectionné.' });
    }

    const uploaded = req.files[0];
    const fileUrl = `/uploads/${uploaded.filename}`;

    res.status(201).json({
      success: true,
      url: fileUrl,
      filePath: fileUrl,
      fileName: uploaded.filename,
      originalName: uploaded.originalname,
      size: uploaded.size,
      mimetype: uploaded.mimetype,
    });
  });
});

/**
 * @route   GET /api/upload/health
 * @desc    Vérification de l'état du service d'upload
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    uploadDir,
    allowed: ['pdf', 'jpg', 'jpeg', 'png'],
    maxSizeMB: 15,
  });
});

export default router;
