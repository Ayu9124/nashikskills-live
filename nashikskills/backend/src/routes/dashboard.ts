/**
 * /api/dashboard
 * 
 * GET /api/dashboard/stats    - Get aggregated stats (total students, companies, avg gap)
 * GET /api/dashboard/sectors  - Get skill gap by sector
 */

import { Router, Request, Response } from 'express';
import { getFirestore } from '../firebase-admin';

const router = Router();

// ── GET overall stats ─────────────────────────────────────────
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const db = getFirestore();

    // Get counts in parallel
    const [industriesSnap, studentsSnap] = await Promise.all([
      db.collection('industry_responses').get(),
      db.collection('student_profiles').get(),
    ]);

    // Calculate average skill gap from industry responses
    const gaps = industriesSnap.docs.map(doc => doc.data().gap || 0);
    const avgGap = gaps.length > 0 
      ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) 
      : 75;

    res.json({
      success: true,
      data: {
        totalCompanies: industriesSnap.size,
        totalStudents: studentsSnap.size,
        averageSkillGap: avgGap,
        lastUpdated: new Date().toISOString(),
      }
    });
  } catch (error: any) {
    console.error('GET /dashboard/stats error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET sector breakdown ──────────────────────────────────────
router.get('/sectors', async (_req: Request, res: Response) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('industry_responses').get();

    // Group responses by sector and calculate averages
    const sectorMap: Record<string, { total: number; count: number }> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const sec = data.sec || 'Other';
      if (!sectorMap[sec]) sectorMap[sec] = { total: 0, count: 0 };
      sectorMap[sec].total += data.gap || 0;
      sectorMap[sec].count += 1;
    });

    const sectors = Object.entries(sectorMap).map(([name, { total, count }]) => ({
      name,
      averageGap: Math.round(total / count),
      responses: count,
    }));

    res.json({ success: true, data: sectors });
  } catch (error: any) {
    console.error('GET /dashboard/sectors error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
