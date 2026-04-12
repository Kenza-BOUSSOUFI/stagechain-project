import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Fichier api-files/.env = source de vérité (override: true) : sinon Windows / le shell peut
// déjà définir ALLOW_MOCK_IPFS_CID=1 ou PINATA_JWT vide et dotenv ne les remplace pas par défaut.
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import { Blob } from 'node:buffer';
import { PinataSDK, PinataError } from 'pinata';

const app = express();
const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

let mongoReady = false;

/**
 * Pinata Cloud : JWT dans PINATA_JWT. Uploads via SDK officiel (réseau public IPFS → onglet Files / Public).
 * JWT absent + ALLOW_MOCK_IPFS_CID=1 → CID factices (dev uniquement).
 */
function resolvePinataContext() {
  const pinataJwt = (process.env.PINATA_JWT || '').trim();
  const jwtPlaceholder = !pinataJwt || /^your_pinata/i.test(pinataJwt);
  const mockAllowed = process.env.ALLOW_MOCK_IPFS_CID === '1';
  // JWT valide → toujours Pinata Cloud (évite ALLOW_MOCK_IPFS_CID=1 qui masquerait les vrais uploads)
  if (pinataJwt && !jwtPlaceholder) {
    return { mode: 'pinata', jwt: pinataJwt };
  }
  if (mockAllowed) return { mode: 'mock' };
  return {
    mode: 'error',
    message:
      'PINATA_JWT manquant ou invalide dans api-files/.env. Copiez le JWT depuis Pinata (https://app.pinata.cloud → Developer → API Keys). Le front React ne lit pas ce JWT : il doit être uniquement dans api-files/.env. Dev sans Pinata : ALLOW_MOCK_IPFS_CID=1',
  };
}

function createPinataClient(jwt) {
  const gateway = (process.env.PINATA_GATEWAY || '').trim();
  return new PinataSDK({
    pinataJwt: jwt,
    ...(gateway ? { pinataGateway: gateway } : {}),
  });
}

function isPinataSdkError(err) {
  return (
    err instanceof PinataError ||
    ['PinataError', 'AuthenticationError', 'NetworkError', 'ValidationError'].includes(err?.name)
  );
}

function pinataErrorPayload(err) {
  if (isPinataSdkError(err)) {
    const status =
      typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
        ? err.statusCode
        : 502;
    let message = err.message || 'Erreur Pinata';
    let reason = '';
    const inner = err.details?.error;
    if (typeof inner === 'string') {
      try {
        const parsed = JSON.parse(inner);
        reason = parsed?.error?.reason || '';
        if (parsed?.error?.message) message = `${message} (${parsed.error.message})`;
      } catch (_) {
        if (inner.includes('API_KEY_REVOKED')) reason = 'API_KEY_REVOKED';
      }
    }
    return { message, reason, status };
  }
  return { message: err?.message || String(err) || 'Erreur inconnue', reason: '', status: 500 };
}

function pinataHint(reason, message, status) {
  if (reason === 'API_KEY_REVOKED' || /revoked/i.test(message)) {
    return 'Créez une nouvelle clé sur https://app.pinata.cloud/developers/keys et mettez à jour PINATA_JWT dans api-files/.env';
  }
  if (status === 401 || status === 403) {
    return 'JWT Pinata invalide ou révoqué : nouvelle clé API + collage du JWT dans api-files/.env';
  }
  return undefined;
}

const conventionSchema = new mongoose.Schema(
  {
    conventionId: { type: Number, required: true, unique: true, index: true },
    candidatureId: { type: Number, required: true },
    etudiantWallet: { type: String, required: true },
    rhWallet: { type: String, required: true },
    adminWallet: { type: String, default: '' },
    offreTitre: { type: String, default: '' },
    statut: { type: String, default: 'EN_ATTENTE_SIGNATURES' },
    content: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    cidIpfs: { type: String, default: '' },
  },
  { timestamps: true }
);

const ConventionDoc = mongoose.model('ConventionDoc', conventionSchema);

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
const jsonParser = express.json();
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/ipfs/pin-pdf') return next();
  return jsonParser(req, res, next);
});

function multerPdfMiddleware(req, res, next) {
  uploadPdf.single('file')(req, res, (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('[api-files] multer:', err?.code || err?.message, err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Fichier trop volumineux (max 8 Mo)' });
      }
      return res.status(400).json({ error: err.message || 'Erreur réception du fichier (multipart, champ « file »)' });
    }
    next();
  });
}

app.get('/health', (_req, res) => {
  const pin = resolvePinataContext();
  res.json({
    ok: true,
    mongoReady,
    pinataMode: pin.mode === 'pinata' ? 'jwt_sdk_public' : pin.mode,
    routes: ['/api/ipfs/pin-json', '/api/ipfs/pin-pdf', '/api/conventions'],
  });
});

app.post('/api/ipfs/pin-json', async (req, res) => {
  try {
    const ctx = resolvePinataContext();
    if (ctx.mode === 'error') {
      return res.status(503).json({
        error:
          'PINATA_JWT manquant ou invalide dans api-files/.env — enregistrez le fichier (Ctrl+S) et redémarrez api-files.',
        hint: ctx.message,
      });
    }
    const { name, content } = req.body || {};
    if (!content) {
      return res.status(400).json({ error: 'content requis' });
    }
    if (ctx.mode === 'mock') {
      const mockCid = `local-dev-mock-${Date.now()}`;
      // eslint-disable-next-line no-console
      console.warn('[api-files] ALLOW_MOCK_IPFS_CID=1 : CID JSON factice (pas sur IPFS réel).');
      return res.json({
        ok: true,
        cid: mockCid,
        gatewayUrl: `https://ipfs.io/ipfs/${mockCid}`,
        mock: true,
      });
    }

    const pinata = createPinataClient(ctx.jwt);
    const uploadRes = await pinata.upload.public
      .json(content)
      .name(name || `convention-${Date.now()}`);
    const cid = uploadRes?.cid;
    if (!cid) {
      return res.status(502).json({ error: 'Réponse Pinata invalide (CID absent)' });
    }

    return res.json({ ok: true, cid, gatewayUrl: `https://ipfs.io/ipfs/${cid}` });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api-files] pin-json:', e);
    const { message, reason, status } = pinataErrorPayload(e);
    const hint = pinataHint(reason, message, status);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message, hint });
  }
});

app.get('/api/ipfs/pin-pdf', (_req, res) => {
  res.json({
    ok: true,
    message: 'Utilisez POST multipart (champ file) pour uploader un PDF vers Pinata.',
  });
});

app.post('/api/ipfs/pin-pdf', multerPdfMiddleware, async (req, res) => {
  try {
    const ctx = resolvePinataContext();
    if (ctx.mode === 'error') {
      return res.status(503).json({
        error:
          'PINATA_JWT manquant ou invalide dans api-files/.env — enregistrez le fichier (Ctrl+S) et redémarrez api-files.',
        hint: ctx.message,
      });
    }
    if (!req.file?.buffer?.length) {
      return res.status(400).json({ error: 'fichier PDF requis (multipart, champ file)' });
    }
    if (ctx.mode === 'mock') {
      const mockCid = `local-dev-mock-pdf-${Date.now()}`;
      // eslint-disable-next-line no-console
      console.warn('[api-files] ALLOW_MOCK_IPFS_CID=1 : CID PDF factice.');
      return res.json({
        ok: true,
        cid: mockCid,
        gatewayUrl: `https://ipfs.io/ipfs/${mockCid}`,
        mock: true,
      });
    }

    const pinata = createPinataClient(ctx.jwt);
    const filename = req.file.originalname || `document-${Date.now()}.pdf`;
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'application/pdf' });
    const uploadRes = await pinata.upload.public.file(blob).name(filename);
    const cid = uploadRes?.cid;
    if (!cid) {
      return res.status(502).json({ error: 'Réponse Pinata invalide (CID absent)' });
    }
    return res.json({ ok: true, cid, gatewayUrl: `https://ipfs.io/ipfs/${cid}` });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api-files] pin-pdf:', e);
    const { message, reason, status } = pinataErrorPayload(e);
    const hint = pinataHint(reason, message, status);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message, hint });
  }
});

// ── MongoDB (optionnel) : copie / index des métadonnées de convention ─────────
app.post('/api/conventions', async (req, res) => {
  try {
    if (!mongoReady) {
      return res.status(503).json({ error: 'MongoDB non disponible (définissez MONGODB_URI dans .env)' });
    }
    const {
      conventionId,
      candidatureId,
      etudiantWallet,
      rhWallet,
      adminWallet,
      offreTitre,
      statut,
      content,
      pdfUrl,
      cidIpfs,
    } = req.body || {};

    if (!Number.isFinite(Number(conventionId))) {
      return res.status(400).json({ error: 'conventionId invalide' });
    }
    if (!Number.isFinite(Number(candidatureId))) {
      return res.status(400).json({ error: 'candidatureId invalide' });
    }
    if (!etudiantWallet || !rhWallet) {
      return res.status(400).json({ error: 'wallet etudiant/rh requis' });
    }

    const data = await ConventionDoc.findOneAndUpdate(
      { conventionId: Number(conventionId) },
      {
        conventionId: Number(conventionId),
        candidatureId: Number(candidatureId),
        etudiantWallet,
        rhWallet,
        adminWallet: adminWallet || '',
        offreTitre: offreTitre || '',
        statut: statut || 'EN_ATTENTE_SIGNATURES',
        content: content || '',
        pdfUrl: pdfUrl || '',
        cidIpfs: cidIpfs || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur serveur' });
  }
});

app.get('/api/conventions/:conventionId', async (req, res) => {
  try {
    if (!mongoReady) {
      return res.status(503).json({ error: 'MongoDB non disponible' });
    }
    const conventionId = Number(req.params.conventionId);
    if (!Number.isFinite(conventionId)) {
      return res.status(400).json({ error: 'conventionId invalide' });
    }
    const data = await ConventionDoc.findOne({ conventionId }).lean();
    if (!data) {
      return res.status(404).json({ error: 'Convention non trouvée en MongoDB' });
    }
    return res.json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur serveur' });
  }
});

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
      mongoReady = true;
      // eslint-disable-next-line no-console
      console.log('MongoDB connected');
    } catch (e) {
      mongoReady = false;
      // eslint-disable-next-line no-console
      console.warn('MongoDB not available:', e.message);
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn('MONGODB_URI absent — routes /api/conventions désactivées.');
  }

  const ctx = resolvePinataContext();
  if (ctx.mode === 'pinata') {
    // eslint-disable-next-line no-console
    console.log('Pinata : JWT chargé — uploads JSON/PDF via SDK (IPFS public)');
  } else if (ctx.mode === 'mock') {
    // eslint-disable-next-line no-console
    console.warn(
      'Pinata : mode MOCK (JWT absent + ALLOW_MOCK_IPFS_CID=1). Mettez PINATA_JWT dans api-files/.env et ALLOW_MOCK_IPFS_CID=0, puis redémarrez ce serveur.'
    );
  } else {
    // eslint-disable-next-line no-console
    console.warn('Pinata : erreur config —', ctx.message);
  }

  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error('[api-files] erreur non gérée', err?.stack || err);
    if (res.headersSent) {
      next(err);
      return;
    }
    res.status(500).json({
      error: err?.message || 'Erreur serveur',
      code: err?.code,
    });
  });

  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`api-files running on http://localhost:${port}`);
    // eslint-disable-next-line no-console
    console.log(`[api-files] .env chargé depuis : ${path.join(__dirname, '.env')}`);
    const j = (process.env.PINATA_JWT || '').trim();
    const mockFlag = process.env.ALLOW_MOCK_IPFS_CID;
    // eslint-disable-next-line no-console
    console.log(`[api-files] ALLOW_MOCK_IPFS_CID effectif = "${mockFlag ?? ''}" (doit être 0 ou absent pour Pinata réel)`);
    // eslint-disable-next-line no-console
    console.log(
      `[api-files] PINATA_JWT : ${j ? `OK (${j.length} caractères, commence par ${j.slice(0, 12)}…)` : 'ABSENT sur le disque — enregistrez api-files/.env (Ctrl+S) si le JWT est seulement dans l’éditeur'}`
    );
    if (!j && process.env.ALLOW_MOCK_IPFS_CID !== '1') {
      // eslint-disable-next-line no-console
      console.warn(
        '[api-files] Sans JWT et sans ALLOW_MOCK_IPFS_CID=1, POST /api/ipfs/* renverra une erreur (pas de Pinata).'
      );
    }
  });
}

start().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
