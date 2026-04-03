const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const Click = require('../models/Click');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication
router.use(authenticate);

// GET /api/admin/stats - Dashboard overview stats
router.get('/stats', async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id };

    const [totalLinks, activeLinks, totalClicks, recentClicks] = await Promise.all([
      Link.countDocuments(query),
      Link.countDocuments({ ...query, isActive: true }),
      Click.countDocuments(
        req.user.role === 'admin'
          ? {}
          : { linkId: { $in: await Link.find(query).distinct('_id') } }
      ),
      Click.countDocuments({
        ...(req.user.role === 'admin'
          ? {}
          : { linkId: { $in: await Link.find(query).distinct('_id') } }),
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      totalLinks,
      activeLinks,
      totalClicks,
      recentClicks,
      inactiveLinks: totalLinks - activeLinks
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/analytics/:linkId - Per-link analytics
router.get('/analytics/:linkId', async (req, res) => {
  try {
    const link = await Link.findById(req.params.linkId);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (req.user.role !== 'admin' && link.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const clicks = await Click.find({ linkId: link._id })
      .sort({ createdAt: -1 })
      .limit(100);

    // Device breakdown
    const deviceStats = await Click.aggregate([
      { $match: { linkId: link._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);

    // Browser breakdown
    const browserStats = await Click.aggregate([
      { $match: { linkId: link._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } }
    ]);

    // OS breakdown
    const osStats = await Click.aggregate([
      { $match: { linkId: link._id } },
      { $group: { _id: '$os', count: { $sum: 1 } } }
    ]);

    // Clicks over time (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const clicksOverTime = await Click.aggregate([
      { $match: { linkId: link._id, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      link,
      totalClicks: link.clicks,
      recentClicks: clicks,
      deviceStats,
      browserStats,
      osStats,
      clicksOverTime
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/clicks-chart - Global clicks over time
router.get('/clicks-chart', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let matchStage = { createdAt: { $gte: startDate } };
    if (req.user.role !== 'admin') {
      const userLinkIds = await Link.find({ createdBy: req.user._id }).distinct('_id');
      matchStage.linkId = { $in: userLinkIds };
    }

    const clicksOverTime = await Click.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(clicksOverTime);
  } catch (error) {
    console.error('Clicks chart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/top-links - Top performing links
router.get('/top-links', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id };

    const topLinks = await Link.find(query)
      .sort({ clicks: -1 })
      .limit(limit);

    res.json(topLinks);
  } catch (error) {
    console.error('Top links error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
