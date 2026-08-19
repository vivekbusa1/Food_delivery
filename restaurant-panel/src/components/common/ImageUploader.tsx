import { useRef, useState, type ChangeEvent } from 'react';
import { Avatar, Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';

interface ImageUploaderProps {
  imageUrl?: string | null;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  isUploading?: boolean;
  shape?: 'circle' | 'square';
  size?: number;
  label?: string;
}

export function ImageUploader({
  imageUrl,
  onUpload,
  onRemove,
  isUploading,
  shape = 'square',
  size = 120,
  label,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onUpload(file);
    e.target.value = '';
  }

  const displayUrl = preview ?? imageUrl ?? undefined;

  return (
    <Stack alignItems="center" spacing={1}>
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? '50%' : 3,
          border: '2px dashed',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
          cursor: 'pointer',
        }}
        onClick={() => inputRef.current?.click()}
      >
        {displayUrl ? (
          <Avatar
            src={displayUrl}
            variant={shape === 'circle' ? 'circular' : 'rounded'}
            sx={{ width: '100%', height: '100%' }}
          />
        ) : (
          <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
        )}
        {isUploading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.4)',
            }}
          >
            <CircularProgress size={28} sx={{ color: '#fff' }} />
          </Box>
        )}
        {displayUrl && onRemove && !isUploading && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              onRemove();
            }}
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {label && (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </Stack>
  );
}
