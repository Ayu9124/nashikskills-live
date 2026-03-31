/**
 * /api/industries
 * 
 * GET  /api/industries         - Get recent industry responses (last 20)
 * POST /api/industries         - Submit a new industry response
 * GET  /api/industries/:id     - Get a specific industry response
 */

import { Router, Request, Response } from 'express';
import { getFirestore } from '../firebase-admin';

const router = Router();

// ── GET all recent industry responses ────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection('industry_responses')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const responses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to readable string
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    res.json({ success: true, data: responses, count: responses.length });
  } catch (error: any) {
    console.error('GET /industries error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST new industry response ────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { companyName, sector, missingSkills, hiringTarget, message } = req.body;

    // Validation
    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      res.status(400).json({ success: false, error: 'companyName is required' });
      return;
    }
    if (!sector || typeof sector !== 'string') {
      res.status(400).json({ success: false, error: 'sector is required' });
      return;
    }
    if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
      res.status(400).json({ success: false, error: 'missingSkills must be a non-empty array' });
      return;
    }

    const db = getFirestore();
    const docData = {
      co: companyName.trim(),
      sec: sector,
      gap: Math.min(100, missingSkills.length * 10 + 40), // simple gap score
      missingSkills,
      hiringTarget: hiringTarget || '1–5',
      message: message?.trim() || '',
      createdAt: new Date(),
    };

    const docRef = await db.collection('industry_responses').add(docData);

    res.status(201).json({ 
      success: true, 
      message: 'Industry response submitted!',
      id: docRef.id 
    });
  } catch (error: any) {
    console.error('POST /industries error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET single industry response ─────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('industry_responses').doc(req.params.id).get();

    if (!doc.exists) {
      res.status(404).json({ success: false, error: 'Not found' });
      return;
    }

    res.json({ 
      success: true, 
      data: { 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate?.()?.toISOString() || null,
      } 
    });
  } catch (error: any) {
    console.error('GET /industries/:id error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
