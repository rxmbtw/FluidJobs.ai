import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface PDFViewerModalProps {
    isOpen: boolean;
    pdfUrl: string;
    fileName?: string;
    onClose: () => void;
    themeState?: 'light' | 'dark';
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, pdfUrl, fileName = 'Document', onClose, themeState = 'light' }) => {
    if (!isOpen) return null;

    const bgColor = themeState === 'light' ? 'bg-white' : 'bg-gray-800';
    const textColor = themeState === 'light' ? 'text-gray-900' : 'text-white';
    const borderColor = themeState === 'light' ? 'border-gray-200' : 'border-gray-700';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`${bgColor} w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
                {/* Header */}
                <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-semibold ${textColor}`}>{fileName}</h3>
                        <a
                            href={pdfUrl}
                            download
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
                            title="Download PDF"
                        >
                            <Download className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                        </a>
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
                            title="Open in new tab"
                        >
                            <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                        </a>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className={`w-6 h-6 ${textColor}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 overflow-hidden relative">
                    <iframe
                        src={`${pdfUrl}#toolbar=0`}
                        className="w-full h-full border-0"
                        title={fileName}
                    />
                </div>

                {/* Footer (Optional) */}
                <div className={`px-6 py-3 border-t ${borderColor} flex justify-end`}>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PDFViewerModal;
