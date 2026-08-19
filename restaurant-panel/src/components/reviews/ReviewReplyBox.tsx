import { useState } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useReplyToReview } from '@/hooks/useReviews';

interface ReviewReplyBoxProps {
  reviewId: string;
}

export function ReviewReplyBox({ reviewId }: ReviewReplyBoxProps) {
  const [reply, setReply] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const replyToReview = useReplyToReview();

  async function handleSubmit() {
    if (!reply.trim()) return;
    await replyToReview.mutateAsync({ id: reviewId, payload: { reply } });
    setReply('');
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <Button size="small" variant="text" onClick={() => setIsOpen(true)} sx={{ mt: 1, alignSelf: 'flex-start' }}>
        Reply
      </Button>
    );
  }

  return (
    <Box sx={{ mt: 1.5, width: '100%' }}>
      <Stack spacing={1}>
        <TextField
          placeholder="Write a public reply…"
          fullWidth
          multiline
          minRows={2}
          size="small"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" disabled={!reply.trim() || replyToReview.isPending} onClick={handleSubmit}>
            {replyToReview.isPending ? 'Posting…' : 'Post reply'}
          </Button>
          <Button size="small" color="inherit" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
