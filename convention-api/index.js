import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';

const app = express();
const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

function resolvePinataContext() {
  const pinataJwt = (process.env.PINATA_JWT || '').trim();
  const jwtPlaceholder = !pinataJwt || /^your_pinata/i.test(pinataJwt);
  const mockAllowed = process.env.ALLOW_MOCK_IPFS_CID === '1';
  if (!pinataJwt || jwtPlaceholder) {
    if (mockAllowed) return { mode: 'mock' };
    return {
      mode: 'error',
      message:
        'PINATA_JWT manquant ou invalide dans convention-api/.env. Ajoutez un JWT Pinata, ou pour le dev local uniquement définissez ALLOW_MOCK_IPFS_CID=1 puis redémarrez l’API.',
    };
  }
  return { mode: 'pinata', jwt: pinataJwt };
}

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
const jsonParser = express.json();
// Ne pas parser le corps en JSON pour le multipart PDF (multer lit le flux brut)
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/ipfs/pin-pdf') return next();
  return jsonParser(req, res, next);
});

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
    pdfUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

const ConventionDoc = mongoose.model('ConventionDoc', conventionSchema);
let mongoReady = false;

app.get('/health', (_req, res) => {
  res.json({ ok: true, mongoReady, routes: ['/api/ipfs/pin-json', '/api/ipfs/pin-pdf'] });
});

app.post('/api/ipfs/pin-json', async (req, res) => {
  try {
    const ctx = resolvePinataContext();
    if (ctx.mode === 'error') {
      return res.status(500).json({ error: ctx.message });
    }
    const { name, content } = req.body || {};
    if (!content) {
      return res.status(400).json({ error: 'content requis' });
    }
    if (ctx.mode === 'mock') {
      const mockCid = `local-dev-mock-${Date.now()}`;
      // eslint-disable-next-line no-console
      console.warn('[convention-api] ALLOW_MOCK_IPFS_CID=1 : CID factice (pas sur IPFS réel).');
      return res.json({
        ok: true,
        cid: mockCid,
        gatewayUrl: `https://ipfs.io/ipfs/${mockCid}`,
        mock: true,
      });
    }

    const payload = {
      pinataContent: content,
      pinataMetadata: {
        name: name || `convention-${Date.now()}`,
      },
    };

    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      payload,
      {
        headers: {
          Authorization: `Bearer ${ctx.jwt}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const cid = pinataRes.data?.IpfsHash;
    if (!cid) {
      return res.status(502).json({ error: 'Réponse Pinata invalide (CID absent)' });
    }

    return res.json({ ok: true, cid, gatewayUrl: `https://ipfs.io/ipfs/${cid}` });
  } catch (e) {
    return res.status(500).json({ error: e?.response?.data?.error?.reason || e.message || 'Erreur Pinata' });
  }
});

app.get('/api/ipfs/pin-pdf', (_req, res) => {
  res.json({
    ok: true,
    message: 'Utilisez POST multipart (champ file) pour uploader un PDF vers Pinata.',
  });
});

app.post('/api/ipfs/pin-pdf', uploadPdf.single('file'), async (req, res) => {
  try {
    const ctx = resolvePinataContext();
    if (ctx.mode === 'error') {
      return res.status(500).json({ error: ctx.message });
    }
    if (!req.file?.buffer?.length) {
      return res.status(400).json({ error: 'fichier PDF requis (multipart, champ file)' });
    }
    if (ctx.mode === 'mock') {
      const mockCid = `local-dev-mock-pdf-${Date.now()}`;
      // eslint-disable-next-line no-console
      console.warn('[convention-api] ALLOW_MOCK_IPFS_CID=1 : CID PDF factice.');
      return res.json({
        ok: true,
        cid: mockCid,
        gatewayUrl: `https://ipfs.io/ipfs/${mockCid}`,
        mock: true,
      });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'convention.pdf',
      contentType: req.file.mimetype || 'application/pdf',
    });
    form.append(
      'pinataMetadata',
      JSON.stringify({ name: req.file.originalname || `convention-${Date.now()}.pdf` })
    );

    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${ctx.jwt}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000,
      }
    );

    const cid = pinataRes.data?.IpfsHash;
    if (!cid) {
      return res.status(502).json({ error: 'Réponse Pinata invalide (CID absent)' });
    }
    return res.json({ ok: true, cid, gatewayUrl: `https://ipfs.io/ipfs/${cid}` });
  } catch (e) {
    return res.status(500).json({
      error: e?.response?.data?.error?.reason || e.message || 'Erreur Pinata (fichier)',
    });
  }
});

app.post('/api/conventions', async (req, res) => {
  try {
    if (!mongoReady) {
      return res.status(503).json({ error: 'MongoDB non disponible' });
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
      pdfUrl
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
        pdfUrl: pdfUrl || ''
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
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      mongoReady = true;
      // eslint-disable-next-line no-console
      console.log('MongoDB connected');
    } catch (e) {
      mongoReady = false;
      // eslint-disable-next-line no-console
      console.warn('MongoDB not available, continuing without Mongo:', e.message);
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn('MONGODB_URI absent, Mongo endpoints disabled.');
  }
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Convention API running on http://localhost:${port}`);
  });
}

start().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start convention-api:', e);
  process.exit(1);
});

