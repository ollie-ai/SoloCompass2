import { body, param, query, validationResult } from 'express-validator';

const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0]?.msg || 'Validation failed', errors: errors.array() });
    }
    next();
  };
};

export const sanitize = (field) => {
  return (req, res, next) => {
    if (req.body[field]) {
      if (typeof req.body[field] === 'string') {
        req.body[field] = escapeHtml(req.body[field]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim());
      }
    }
    next();
  };
};

export const sanitizeAll = (fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = escapeHtml(req.body[field]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim());
      }
    }
    next();
  };
};

export const userValidation = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  update: [
    param('id').isInt({ min: 1 }),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('role').optional().isIn(['user', 'viewer', 'admin']),
  ],
};

export const resourceValidation = {
  create: [
    body('name').trim().notEmpty().isLength({ min: 1, max: 255 }).withMessage('Name required'),
    body('type').optional().trim().isLength({ max: 50 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('category_id').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    body('tags').optional().isArray(),
  ],
  update: [
    param('id').isInt({ min: 1 }),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('type').optional().trim().isLength({ max: 50 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('category_id').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    body('tags').optional().isArray(),
  ],
  list: [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('search').optional().trim().isLength({ max: 100 }),
    query('category_id').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['draft', 'published', 'archived']),
  ],
};

export const categoryValidation = {
  create: [
    body('name').trim().notEmpty().isLength({ min: 1, max: 100 }).withMessage('Name required'),
    body('slug').optional().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with hyphens'),
    body('description').optional().trim().isLength({ max: 500 }),
  ],
  update: [
    param('id').isInt({ min: 1 }),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('slug').optional().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/),
    body('description').optional().trim().isLength({ max: 500 }),
  ],
};

export const paginationValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
];