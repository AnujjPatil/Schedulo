'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      onImageSelect(file);
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      <UploadBox
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          opacity: disabled ? 0.5 : 1,
          borderColor: isDragging ? 'primary.main' : 'rgba(255, 255, 255, 0.23)',
          color: 'white',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
        }}
      >
        {isUploading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <CloudUploadIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="body2" className="text-zinc-400" sx={{ mt: 1 }}>
              {disabled
                ? 'Image upload disabled'
                : 'Drag and drop an image here, or click to select'}
            </Typography>
            <Typography variant="caption" className="text-zinc-500">
              Supported formats: JPG, PNG, GIF
            </Typography>
          </>
        )}
      </UploadBox>
    </Box>
  );
};

export default ImageUpload; 