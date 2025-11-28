import { supabaseAdmin } from '@/lib/supabase';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 10MB max file size
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ 
      error: 'Supabase not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.' 
    });
  }

  try {
    const { file, folder, fileName } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type (images only)
    const fileType = file.split(';')[0].split(':')[1];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
    }

    // Convert base64 to buffer
    const base64Data = file.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename if not provided
    const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileType.split('/')[1]}`;
    const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('farmshield-uploads')
      .upload(filePath, buffer, {
        contentType: fileType,
        upsert: false,
      });

    if (error) {
      // If bucket doesn't exist, try to create it (this might fail if no permissions)
      console.error('Upload error:', error);
      
      // Try to create bucket if it doesn't exist
      if (error.message?.includes('Bucket not found')) {
        // Note: Creating buckets requires admin privileges
        // For now, return error with instructions
        return res.status(500).json({ 
          error: 'Storage bucket not found. Please create a bucket named "farmshield-uploads" in Supabase Storage.',
          details: error.message 
        });
      }
      
      return res.status(500).json({ error: 'Upload failed', details: error.message });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('farmshield-uploads')
      .getPublicUrl(filePath);

    return res.status(200).json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

