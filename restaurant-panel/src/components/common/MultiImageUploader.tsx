import { useRef, type ChangeEvent } from 'react';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { resolveAssetUrl } from '@/utils/formatters';
import { ASSET_BASE_URL } from '@/utils/constants';

interface MultiImageUploaderProps {
  images: string[];
  onAdd: (files: File[]) => void;
  onRemove: (imageUrl: string) => void;
  isUploading?: boolean;
  maxImages?: number;
}

export function MultiImageUploader({
  images,
  onAdd,
  onRemove,
  isUploading,
  maxImages = 5,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    e.target.value = '';
  }

  return (
    <Box>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        {images.map((img) => (
          <Paper
            key={img}
            variant="outlined"
            sx={{
              position: 'relative',
              width: 96,
              height: 96,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={resolveAssetUrl(img, ASSET_BASE_URL)}
              alt="Food"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <IconButton
              size="small"
              onClick={() => onRemove(img)}
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
          </Paper>
        ))}
        {images.length < maxImages && (
          <Paper
            variant="outlined"
            onClick={() => inputRef.current?.click()}
            sx={{
              width: 96,
              height: 96,
              borderRadius: 2,
              borderStyle: 'dashed',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'text.disabled',
              gap: 0.5,
              opacity: isUploading ? 0.6 : 1,
            }}
          >
            <AddPhotoAlternateOutlinedIcon />
            <Typography variant="caption">{isUploading ? 'Uploading…' : 'Add'}</Typography>
          </Paper>
        )}
      </Stack>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleChange} />
    </Box>
  );
}
