import React, { ChangeEvent, useState } from 'react';

interface FileUploaderProps {
  onFileUpload: (fileContent: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      onFileUpload(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <input
      type="file"
      accept=".csv"
      onChange={handleFileChange}
      className="border border-gray-300 p-2 rounded"
    />
  );
};

export default FileUploader;
