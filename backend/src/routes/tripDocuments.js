import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { sanitizeAll } from '../middleware/validate.js';
import db from '../db.js';
import logger from '../services/logger.js';
import { supabaseStorage } from '../services/supabaseStorage.js';
import { createNotification } from '../services/notificationService.js';

const router = express.Router({ mergeParams: true });

async function checkDocumentExpiry(userId, document) {
  if (!document.expiry_date) return;
  
  const expiryDate = new Date(document.expiry_date);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
    await createNotification(
      userId,
      'document_expiry',
      'Document Expiring Soon',
      `Your ${document.name} expires in ${daysUntilExpiry} days. Please renew before your trip.`,
      { documentId: document.id, documentType: document.document_type, documentName: document.name, expiryDate: document.expiry_date }
    );
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
    }
  },
});

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/:tripId/documents', requireAuth, async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const documents = await db.prepare(`
      SELECT id, trip_id, document_type, name, file_url, expiry_date, notes, created_at FROM trip_documents 
      WHERE trip_id = ?
      ORDER BY created_at DESC
    `).all(tripId);

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    logger.error('Get trip documents error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch documents' } });
  }
});

router.post('/:tripId/documents/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
    }

    const { tripId } = req.params;
    const { document_type, name, expiry_date, notes } = req.body;

    if (!document_type || !['passport', 'visa', 'insurance', 'booking_conf', 'other'].includes(document_type)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_TYPE', message: 'Invalid or missing document type' } });
    }

    const trip = await db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' } });
    }

    const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
    const filePath = `users/${req.userId}/trips/${tripId}/${fileName}`;

    logger.info(`Uploading file to Supabase Storage: ${filePath} (${req.file.mimetype}, ${req.file.size} bytes)`);

    const { fileUrl, error: uploadError } = await supabaseStorage.uploadFile(filePath, req.file.buffer, req.file.mimetype);

    if (uploadError) {
      logger.error('Supabase Storage upload failed:', uploadError);
      return res.status(500).json({ success: false, error: { code: 'UPLOAD_FAILED', message: 'Failed to upload file to storage' } });
    }

    const result = await db.prepare(`
      INSERT INTO trip_documents (trip_id, document_type, name, file_url, expiry_date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      tripId,
      document_type,
      name || req.file.originalname,
      fileUrl,
      expiry_date || null,
      notes || null
    );

    const document = await db.prepare('SELECT id, trip_id, document_type, name, file_url, expiry_date, notes, created_at FROM trip_documents WHERE id = ?').get(result.lastInsertRowid);

    logger.info(`Document uploaded successfully: ${document.id}`);

    if (expiry_date) {
      checkDocumentExpiry(req.userId, document);
    }

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error('Upload trip document error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to upload document' } });
  }
});

router.post('/:tripId/documents', requireAuth, sanitizeAll(['name', 'file_url', 'notes']), [
  body('document_type').notEmpty().withMessage('Document type is required')
    .isIn(['passport', 'visa', 'insurance', 'booking_conf', 'other'])
    .withMessage('Invalid document type'),
  body('name').notEmpty().withMessage('Name is required'),
  body('file_url').optional().isString(),
  body('expiry_date').optional().isISO8601().withMessage('Invalid expiry date format'),
], handleValidationErrors, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { document_type, name, file_url, expiry_date, notes } = req.body;

    const trip = await db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const result = await db.prepare(`
      INSERT INTO trip_documents (trip_id, document_type, name, file_url, expiry_date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      tripId,
      document_type,
      name,
      file_url || null,
      expiry_date || null,
      notes || null
    );

    const document = await db.prepare('SELECT id, trip_id, document_type, name, file_url, expiry_date, notes, created_at FROM trip_documents WHERE id = ?').get(result.lastInsertRowid);

    if (expiry_date) {
      checkDocumentExpiry(req.userId, document);
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error('Create trip document error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create document' } });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const document = await db.prepare('SELECT id, trip_id, document_type, name, file_url, expiry_date, notes, created_at FROM trip_documents WHERE id = ?').get(id);
    if (!document) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    if (!document.file_url) {
      return res.status(404).json({ success: false, error: { code: 'NO_FILE', message: 'No file associated with this document' } });
    }

    const fileName = document.file_url.split('/').pop();
    const storagePrefix = `${process.env.SUPABASE_URL}/storage/v1/object/public/trip-documents/`;
    const filePath = document.file_url.startsWith(storagePrefix)
      ? document.file_url.replace(storagePrefix, '')
      : document.file_url.includes('/trip-documents/')
        ? document.file_url.split('/trip-documents/').pop()
        : null;

    if (!filePath) {
      logger.error('Could not extract file path from URL:', document.file_url);
      return res.status(500).json({ success: false, error: { code: 'INVALID_URL', message: 'Invalid file URL' } });
    }
    logger.info(`Downloading file from Supabase Storage: ${filePath}`);

    const { buffer, mimeType, error: downloadError } = await supabaseStorage.downloadFile(filePath);

    if (downloadError) {
      logger.error('Supabase Storage download failed:', downloadError);
      return res.status(500).json({ success: false, error: { code: 'DOWNLOAD_FAILED', message: 'Failed to download file' } });
    }

    res.set({
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  } catch (error) {
    logger.error('Download trip document error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to download document' } });
  }
});

router.put('/:id', requireAuth, sanitizeAll(['name', 'file_url', 'notes']), [
  body('document_type').optional().isIn(['passport', 'visa', 'insurance', 'booking_conf', 'other']),
  body('name').optional().isString(),
  body('file_url').optional({ nullable: true, checkFalsy: true }).isString(),
  body('expiry_date').optional().isISO8601(),
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { document_type, name, file_url, expiry_date, notes } = req.body;

    const existing = await db.prepare('SELECT id FROM trip_documents WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updates = [];
    const values = [];

    if (document_type !== undefined) {
      updates.push('document_type = ?');
      values.push(document_type);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (file_url !== undefined) {
      updates.push('file_url = ?');
      values.push(file_url || null);
    }
    if (expiry_date !== undefined) {
      updates.push('expiry_date = ?');
      values.push(expiry_date || null);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await db.prepare(`
      UPDATE trip_documents SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    const document = await db.prepare('SELECT id, trip_id, document_type, name, file_url, expiry_date, notes, created_at FROM trip_documents WHERE id = ?').get(id);

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error('Update trip document error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update document' } });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.prepare('SELECT id, file_url FROM trip_documents WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (existing.file_url) {
      const storagePrefix = `${process.env.SUPABASE_URL}/storage/v1/object/public/trip-documents/`;
      const filePath = existing.file_url.startsWith(storagePrefix)
        ? existing.file_url.replace(storagePrefix, '')
        : existing.file_url.includes('/trip-documents/')
          ? existing.file_url.split('/trip-documents/').pop()
          : null;

      if (filePath) {
        await supabaseStorage.deleteFile(filePath);
        logger.info(`Deleted file from Supabase Storage: ${filePath}`);
      }
    }

    await db.prepare('DELETE FROM trip_documents WHERE id = ?').run(id);

    res.json({
      success: true,
      data: { message: 'Document deleted successfully' }
    });
  } catch (error) {
    logger.error('Delete trip document error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete document' } });
  }
});

export default router;
