import React, { useRef, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface ImageUploaderProps {
  label?: string;
  value?: string | null;
  onChange: (file: File | null) => void;
  height?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label = 'Upload Image', value, onChange, height = 160 }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    onChange(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClear = () => {
    onChange(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {label}
      </Typography>
      <Box
        onClick={() => inputRef.current?.click()}
        sx={{
          position: 'relative',
          height,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          bgcolor: 'action.hover',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        {preview ? (
          <>
            <Box component="img" src={preview} alt="preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'background.paper' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Stack alignItems="center" spacing={1} color="text.secondary">
            <CloudUploadOutlinedIcon />
            <Typography variant="caption">Click to upload</Typography>
          </Stack>
        )}
      </Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {!preview && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => inputRef.current?.click()}>
          Choose File
        </Button>
      )}
    </Box>
  );
};

export default ImageUploader;
