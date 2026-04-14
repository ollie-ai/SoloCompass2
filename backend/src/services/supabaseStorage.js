import logger from './logger.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DEFAULT_BUCKET = 'trip-documents';
const AVATAR_BUCKET = 'avatars';

if (!SUPABASE_URL) {
  logger.warn('[SupabaseStorage] SUPABASE_URL not set. Storage operations will fail.');
}

if (!SUPABASE_SERVICE_KEY) {
  logger.warn('[SupabaseStorage] SUPABASE_SERVICE_KEY not set. Storage operations will fail.');
}

async function ensureBucketExists(bucketName) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: bucketName,
        name: bucketName,
        public: true,
      }),
    });

    if (response.ok) {
      logger.info(`[SupabaseStorage] Bucket '${bucketName}' created`);
      return true;
    }

    const error = await response.json().catch(() => ({}));
    if (error.message?.includes('already exists') || response.status === 409) {
      return true;
    }

    logger.warn(`[SupabaseStorage] Failed to create bucket '${bucketName}':`, error);
    return false;
  } catch (error) {
    logger.error(`[SupabaseStorage] Error ensuring bucket '${bucketName}' exists:`, error.message);
    return false;
  }
}

export const supabaseStorage = {
  async uploadFile(filePath, buffer, mimeType, bucket = DEFAULT_BUCKET) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return { fileUrl: null, error: 'Supabase credentials not configured' };
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Content-Type': mimeType || 'application/octet-stream',
          },
          body: buffer,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        // If file already exists, try to update it
        if (response.status === 400 && error.error === 'Duplicate') {
            const updateResponse = await fetch(
                `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
                {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Content-Type': mimeType || 'application/octet-stream',
                  },
                  body: buffer,
                }
              );
              if (updateResponse.ok) {
                const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
                return { fileUrl, error: null };
              }
        }

        logger.error(`[SupabaseStorage] Upload failed for ${filePath} in ${bucket}:`, error);
        return { fileUrl: null, error: error.message || 'Upload failed' };
      }

      const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
      logger.info(`[SupabaseStorage] File uploaded successfully to ${bucket}: ${fileUrl}`);
      return { fileUrl, error: null };
    } catch (error) {
      logger.error(`[SupabaseStorage] Upload error in ${bucket}:`, error.message);
      return { fileUrl: null, error: error.message };
    }
  },

  async downloadFile(filePath, bucket = DEFAULT_BUCKET) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return { buffer: null, mimeType: null, error: 'Supabase credentials not configured' };
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        logger.error(`[SupabaseStorage] Download failed for ${filePath} from ${bucket}:`, error);
        return { buffer: null, mimeType: null, error: error.message || 'Download failed' };
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const mimeType = response.headers.get('content-type') || 'application/octet-stream';
      return { buffer, mimeType, error: null };
    } catch (error) {
      logger.error(`[SupabaseStorage] Download error from ${bucket}:`, error.message);
      return { buffer: null, mimeType: null, error: error.message };
    }
  },

  async deleteFile(filePath, bucket = DEFAULT_BUCKET) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return { error: 'Supabase credentials not configured' };
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        logger.error(`[SupabaseStorage] Delete failed for ${filePath} from ${bucket}:`, error);
        return { error: error.message || 'Delete failed' };
      }

      logger.info(`[SupabaseStorage] File deleted from ${bucket}: ${filePath}`);
      return { error: null };
    } catch (error) {
      logger.error(`[SupabaseStorage] Delete error from ${bucket}:`, error.message);
      return { error: error.message };
    }
  },

  async init() {
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      await ensureBucketExists(DEFAULT_BUCKET);
      await ensureBucketExists(AVATAR_BUCKET);
    }
  },
};
