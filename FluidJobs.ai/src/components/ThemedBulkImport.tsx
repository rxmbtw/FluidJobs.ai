import React from 'react';
import BulkImportSection from './BulkImportSection';

interface ThemedBulkImportProps {
  themeState?: any;
}

const ThemedBulkImport: React.FC<ThemedBulkImportProps> = ({ themeState }) => {
  return <BulkImportSection />;
};

export default ThemedBulkImport;