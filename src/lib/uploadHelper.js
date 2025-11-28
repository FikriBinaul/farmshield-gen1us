/**
 * Helper function untuk upload foto ke Supabase Storage via API
 * @param {File} file - File object dari input file
 * @param {string} folder - Folder di storage (optional)
 * @returns {Promise<string>} URL foto yang diupload
 */
export async function uploadPhoto(file, folder = '') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        const fileName = file.name;

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64,
            folder: folder,
            fileName: fileName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        resolve(data.url);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate file sebelum upload
 * @param {File} file - File object
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateImageFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File harus berupa gambar (JPG, PNG, GIF, atau WEBP)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Ukuran file maksimal 10MB' };
  }

  return { valid: true };
}

