const express = require('express');
const router = express.Router();
const { customAlphabet } = require('nanoid');
const validator = require('validator');
const Link = require('../models/Link');
const { authenticate } = require('../middleware/auth');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

// POST /api/links - Create a short link
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      url,
      customAlias,
      title,
      description,
      funnelContent,
      redirectDelay,
      expiresAt
    } = req.body;

    if (!url || !validator.isURL(url, { require_protocol: true })) {
      return res.status(400).json({
        error: 'A valid URL with protocol (http/https) is required'
      });
    }

    // Check for duplicate URL by same user
    const existingLink = await Link.findOne({
      originalUrl: url,
      createdBy: req.user._id
    });
    if (existingLink) {
      return res.json(existingLink);
    }

    // Handle custom alias
    let shortCode;
    if (customAlias) {
      const aliasExists = await Link.findOne({
        $or: [{ shortCode: customAlias }, { customAlias }]
      });
      if (aliasExists) {
        return res.status(409).json({ error: 'Custom alias already taken' });
      }
      shortCode = customAlias;
    } else {
      shortCode = nanoid();
      // Ensure uniqueness
      while (await Link.findOne({ shortCode })) {
        shortCode = nanoid();
      }
    }

    const link = await Link.create({
      originalUrl: url,
      shortCode,
      customAlias: customAlias || undefined,
      title: title || undefined,
      description: description || undefined,
      funnelContent: funnelContent || undefined,
      redirectDelay: redirectDelay !== undefined ? redirectDelay : 3,
      expiresAt: expiresAt || undefined,
      createdBy: req.user._id
    });

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    res.status(201).json({
      ...link.toObject(),
      shortUrl: `${baseUrl}/${link.shortCode}`
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/links/bulk - Bulk create short links
router.post('/bulk', authenticate, async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'An array of URLs is required' });
    }
    if (urls.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 URLs per batch' });
    }

    const results = [];
    for (const url of urls) {
      if (!validator.isURL(url, { require_protocol: true })) {
        results.push({ url, error: 'Invalid URL' });
        continue;
      }

      let shortCode = nanoid();
      while (await Link.findOne({ shortCode })) {
        shortCode = nanoid();
      }

      const link = await Link.create({
        originalUrl: url,
        shortCode,
        createdBy: req.user._id
      });

      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      results.push({
        ...link.toObject(),
        shortUrl: `${baseUrl}/${link.shortCode}`
      });
    }

    res.status(201).json({ results });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/links - Get user's links
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const [links, total] = await Promise.all([
      Link.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Link.countDocuments(query)
    ]);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const enrichedLinks = links.map(link => ({
      ...link.toObject(),
      shortUrl: `${baseUrl}/${link.shortCode}`
    }));

    res.json({
      links: enrichedLinks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/links/:id - Update a link
router.put('/:id', authenticate, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (req.user.role !== 'admin' && link.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const allowedUpdates = [
      'title', 'description', 'funnelContent',
      'redirectDelay', 'isActive', 'expiresAt', 'originalUrl'
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        link[key] = req.body[key];
      }
    }

    await link.save();
    res.json(link);
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/links/:id - Delete a link
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (req.user.role !== 'admin' && link.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Link.findByIdAndDelete(req.params.id);
    res.json({ message: 'Link deleted' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
