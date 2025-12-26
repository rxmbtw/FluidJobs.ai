import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

interface ResizeImagePageProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onUpload: (image: string) => void;
}

const ResizeImagePage: React.FC<ResizeImagePageProps> = ({ isOpen, onClose, imageUrl, onUpload }) => {
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 });
  const [cropSize, setCropSize] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_CROP_SIZE = 100;
  const MAX_CROP_SIZE = 300;

  useEffect(() => {
    if (imageUrl && imageRef.current) {
      const img = new Image();
      img.onload = () => {
        const container = containerRef.current;
        if (container) {
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          const aspectRatio = img.width / img.height;
          
          let displayWidth, displayHeight;
          if (containerWidth / containerHeight > aspectRatio) {
            displayHeight = containerHeight;
            displayWidth = displayHeight * aspectRatio;
          } else {
            displayWidth = containerWidth;
            displayHeight = displayWidth / aspectRatio;
          }
          
          setImageDimensions({ width: displayWidth, height: displayHeight });
          setCropPosition({ x: displayWidth / 2, y: displayHeight / 2 });
        }
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropPosition.x, y: e.clientY - cropPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const halfSize = cropSize / 2;
    const maxX = imageDimensions.width - halfSize;
    const maxY = imageDimensions.height - halfSize;
    
    setCropPosition({
      x: Math.max(halfSize, Math.min(newX, maxX)),
      y: Math.max(halfSize, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - cropPosition.x, y: touch.clientY - cropPosition.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    const halfSize = cropSize / 2;
    const maxX = imageDimensions.width - halfSize;
    const maxY = imageDimensions.height - halfSize;
    
    setCropPosition({
      x: Math.max(halfSize, Math.min(newX, maxX)),
      y: Math.max(halfSize, Math.min(newY, maxY))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (!imageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageRef.current;
    const scaleX = img.naturalWidth / imageDimensions.width;
    const scaleY = img.naturalHeight / imageDimensions.height;
    
    const cropX = (cropPosition.x - cropSize / 2) * scaleX;
    const cropY = (cropPosition.y - cropSize / 2) * scaleY;
    const cropWidth = cropSize * scaleX;
    const cropHeight = cropSize * scaleY;
    
    canvas.width = 140;
    canvas.height = 140;
    
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, 140, 140
    );
    
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onUpload(croppedImage);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#FFFFFF',
      zIndex: 10002,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
        background: '#FFFFFF'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft style={{ width: '24px', height: '24px', color: '#6E6E6E' }} />
        </button>
        <h2 style={{
          fontFamily: 'Poppins',
          fontSize: '18px',
          fontWeight: 600,
          color: '#000000',
          marginLeft: '12px'
        }}>
          Resize Image
        </h2>
      </div>

      {/* Image Preview Area */}
      <div
        ref={containerRef}
        style={{
          height: 'calc(100vh - 72px - 76px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#F9FAFB',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Selected"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
              userSelect: 'none'
            }}
            draggable={false}
          />
          
          {/* Crop Overlay */}
          {imageDimensions.width > 0 && (
            <>
              {/* Dark overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.5)',
                pointerEvents: 'none'
              }} />
              
              {/* Crop frame */}
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{
                  position: 'absolute',
                  left: `${cropPosition.x - cropSize / 2}px`,
                  top: `${cropPosition.y - cropSize / 2}px`,
                  width: `${cropSize}px`,
                  height: `${cropSize}px`,
                  border: '3px solid #6C5CE7',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none'
                }}
              >
                {/* Corner indicators */}
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '-3px',
                  width: '20px',
                  height: '20px',
                  borderTop: '3px solid #FFFFFF',
                  borderLeft: '3px solid #FFFFFF'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '20px',
                  height: '20px',
                  borderTop: '3px solid #FFFFFF',
                  borderRight: '3px solid #FFFFFF'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-3px',
                  left: '-3px',
                  width: '20px',
                  height: '20px',
                  borderBottom: '3px solid #FFFFFF',
                  borderLeft: '3px solid #FFFFFF'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-3px',
                  right: '-3px',
                  width: '20px',
                  height: '20px',
                  borderBottom: '3px solid #FFFFFF',
                  borderRight: '3px solid #FFFFFF'
                }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '16px',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '14px',
            background: '#FFFFFF',
            border: '2px solid #E5E7EB',
            borderRadius: '12px',
            fontFamily: 'Poppins',
            fontSize: '15px',
            fontWeight: 600,
            color: '#6E6E6E',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          style={{
            flex: 1,
            padding: '14px',
            background: '#6C5CE7',
            border: 'none',
            borderRadius: '12px',
            fontFamily: 'Poppins',
            fontSize: '15px',
            fontWeight: 600,
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
        >
          Upload
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ResizeImagePage;
