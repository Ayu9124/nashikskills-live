/**
 * /api/students
 * 
 * GET  /api/students/:uid         - Get a student profile by Firebase UID
 * PUT  /api/students/:uid         - Create or update a student profile
 * GET  /api/students/search       - Search students by sector/skill
 */

import { Router, Request, Response } from 'express';
import { getFirestore } from '../firebase-admin';

const router = Router();

// ── GET student profile ───────────────────────────────────────
router.get('/:uid', async (req: Request, res: Response) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('student_profiles').doc(req.params.uid).get();

    if (!doc.exists) {
      res.status(404).json({ success: false, error: 'Student profile not found' });
      return;
    }

    res.json({ 
      success: true, 
      data: { 
        id: doc.id, 
        ...doc.data(),
        updatedAt: doc.data()?.updatedAt?.toDate?.()?.toISOString() || null,
      } 
    });
  } catch (error: any) {
    console.error('GET /students/:uid error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── PUT (create/update) student profile ──────────────────────
router.put('/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { displayName, email, college, targetSector, mySkills } = req.body;

    // Basic validation
    if (!displayName || !email) {
      res.status(400).json({ success: false, error: 'displayName and email are required' });
      return;
    }

    const db = getFirestore();
    const profileData = {
      uid,
      displayName: displayName.trim(),
      email: email.trim(),
      college: college?.trim() || '',
      targetSector: targetSector || 'auto',
      mySkills: Array.isArray(mySkills) ? mySkills : [],
      updatedAt: new Date(),
    };

    await db.collection('student_profiles').doc(uid).set(profileData, { merge: true });

    res.json({ 
      success: true, 
      message: 'Student profile saved!',
      data: profileData
    });
  } catch (error: any) {
    console.error('PUT /students/:uid error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET search students by sector ────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sector, skill } = req.query;
    const db = getFirestore();

    let queryRef = db.collection('student_profiles').limit(50) as FirebaseFirestore.Query;

    if (sector && typeof sector === 'string') {
      queryRef = queryRef.where('targetSector', '==', sector);
    }

    const snapshot = await queryRef.get();
    let students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data()?.updatedAt?.toDate?.()?.toISOString() || null,
      // Remove sensitive data from list view
      email: undefined,
    }));

    // Filter by skill if provided
    if (skill && typeof skill === 'string') {
      students = students.filter(s => 
        (s as any).mySkills?.some((sk: string) => 
          sk.toLowerCase().includes(skill.toLowerCase())
        )
      );
    }

    res.json({ success: true, data: students, count: students.length });
  } catch (error: any) {
    console.error('GET /students error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
