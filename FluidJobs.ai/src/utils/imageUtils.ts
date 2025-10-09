export const generateImageSizes = async (blob: Blob): Promise<{
  full: string;
  medium: string;
  thumbnail: string;
}> => {
  const createImageUrl = (blob: Blob, size: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, size, size);
        canvas.toBlob((resizedBlob) => {
          resolve(URL.createObjectURL(resizedBlob as Blob));
        }, 'image/jpeg', 1.0);
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  const [full, medium, thumbnail] = await Promise.all([
    createImageUrl(blob, 800),
    createImageUrl(blob, 300),
    createImageUrl(blob, 150),
  ]);

  return { full, medium, thumbnail };
};
