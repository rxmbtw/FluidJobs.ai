import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface PDFViewerModalProps {
  isOpen: boolean;
  pdfUrl: string;
  fileName: string;
  onClose: () => void;
  themeState?: 'light' | 'dark';
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, pdfUrl, fileName, onClose, themeState = 'light' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-[90%] h-[90%] max-w-4xl rounded-2xl overflow-hidden" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: themeState === 'light' ? '#E5E7EB' : '#374151' }}>
          <h2 className="text-lg font-bold font-['Poppins']" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
            {fileName}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition">
            <X className="w-5 h-5" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center h-[calc(100%-120px)] overflow-auto p-4">
          <Document
            file={{ url: pdfUrl }}
            onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPageNumber(1); }}
            onLoadError={(error) => console.error('PDF load error:', error)}
            loading={<div style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>Loading PDF...</div>}
            error={<div style={{ color: '#EF4444' }}>Failed to load PDF. Check console for details.</div>}
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
              cMapPacked: true,
            }}
          >
            <Page pageNumber={pageNumber} width={Math.min(window.innerWidth * 0.8, 800)} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        </div>

        {numPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t" style={{ borderColor: themeState === 'light' ? '#E5E7EB' : '#374151' }}>
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
              className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewerModal;
