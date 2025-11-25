import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
  themeState?: 'light' | 'dark';
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, imageSrc, onClose, onCropComplete, themeState = 'light' }) => {
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onCropComplete(croppedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-[90%] max-w-2xl rounded-2xl p-6" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition">
          <X className="w-5 h-5" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }} />
        </button>

        <h2 className="text-xl font-bold font-['Poppins'] mb-4" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
          Crop Profile Picture
        </h2>

        <div className="flex justify-center mb-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img ref={imgRef} src={imageSrc} alt="Crop" style={{ maxHeight: '400px' }} />
          </ReactCrop>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg font-['Poppins'] font-semibold transition" style={{ borderColor: themeState === 'light' ? '#000000' : '#6B7280', color: themeState === 'light' ? '#000000' : '#E5E7EB' }}>
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-[#4285F4] text-white rounded-lg font-['Poppins'] font-semibold hover:opacity-90 transition">
            Save & Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
