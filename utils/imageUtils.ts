/**
 * Compresses a Blob/File to a Base64 string ensuring the size is strictly under 800KB (Firestore limit safe zone).
 * It recursively reduces quality/dimensions until the target size is met.
 */
export const compressImageToBase64 = (blob: Blob, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Initial resize
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Function to check size and compress
        const attemptCompression = (q: number, attempt: number) => {
          const dataUrl = canvas.toDataURL('image/jpeg', q);
          // Base64 length * 0.75 is approx byte size
          const byteSize = dataUrl.length * 0.75;
          const targetSize = 800 * 1024; // 800KB

          if (byteSize < targetSize || q < 0.2 || attempt > 5) {
            if (byteSize > 1024 * 1024) {
               console.warn("Image still > 1MB after compression, forcing low res");
               // Hard fallback if still huge
               const scale = 0.5;
               const smCanvas = document.createElement('canvas');
               smCanvas.width = width * scale;
               smCanvas.height = height * scale;
               smCanvas.getContext('2d')?.drawImage(canvas, 0, 0, smCanvas.width, smCanvas.height);
               resolve(smCanvas.toDataURL('image/jpeg', 0.5));
            } else {
               resolve(dataUrl);
            }
          } else {
            // Recursively try lower quality
            attemptCompression(q - 0.15, attempt + 1);
          }
        };

        attemptCompression(quality, 1);
      };
      
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};