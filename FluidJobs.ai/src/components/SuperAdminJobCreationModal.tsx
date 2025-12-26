import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import JobCreationForm from './JobCreationForm';

interface SuperAdminJobCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SuperAdminJobCreationModal: React.FC<SuperAdminJobCreationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative">
        <style>{`
          .bg-indigo-600 { background-color: #2563EB !important; }
          .hover\:bg-indigo-700:hover { background-color: #1D4ED8 !important; }
          .text-indigo-600 { color: #2563EB !important; }
          .text-indigo-700 { color: #1D4ED8 !important; }
          .text-indigo-800 { color: #1E40AF !important; }
          .border-indigo-600 { border-color: #2563EB !important; }
          .ring-indigo-200 { --tw-ring-color: #BFDBFE !important; }
          .focus\:ring-indigo-500:focus { --tw-ring-color: #3B82F6 !important; }
          .bg-indigo-100 { background-color: #DBEAFE !important; }
          .bg-indigo-600\/20 { background-color: rgba(37, 99, 235, 0.2) !important; }
        `}</style>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition bg-white rounded-full p-2 shadow-md"
        >
          <X className="w-6 h-6" />
        </button>
        <JobCreationForm onBack={handleSuccess} isSuperAdmin={true} />
      </div>
    </div>,
    document.body
  );
};

export default SuperAdminJobCreationModal;
