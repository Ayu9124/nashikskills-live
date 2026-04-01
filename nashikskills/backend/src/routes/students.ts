import { Router, Request, Response } from 'express';
import { getFirestore } from '../firebase-admin';

const router = Router();

// GET student profile
router.get('/:uid', async (req: Request, res: Response) => {
  try {
    const db = getFirestore();
    const uid = Array.isArray(req.params.uid) ? req.params.uid[0] : req.params.uid;

    const doc = await db.collection('student_profiles').doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data()?.updatedAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT student profile
router.put('/:uid', async (req: Request, res: Response) => {
  try {
    const uid = Array.isArray(req.params.uid) ? req.params.uid[0] : req.params.uid;

    const { displayName, email, college, targetSector, mySkills } = req.body;

    if (!displayName || !email) {
      return res.status(400).json({ success: false, error: 'displayName and email required' });
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

    res.json({ success: true, data: profileData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET students list
router.get('/', async (req: Request, res: Response) => {
  try {
    const sector = Array.isArray(req.query.sector) ? req.query.sector[0] : req.query.sector;
    const skill = Array.isArray(req.query.skill) ? req.query.skill[0] : req.query.skill;

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
    }));

    if (skill && typeof skill === 'string') {
      students = students.filter((s: any) =>
        s.mySkills?.some((sk: string) =>
          sk.toLowerCase().includes(skill.toLowerCase())
        )
      );
    }

    res.json({ success: true, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;