import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ReviewReplyBox } from '@/components/reviews/ReviewReplyBox';
import { useReviewSummary, useReviews } from '@/hooks/useReviews';
import { formatDate, getInitials } from '@/utils/formatters';

const PAGE_SIZE = 10;

export default function ReviewsPage() {
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      rating: ratingFilter === 'all' ? undefined : ratingFilter,
    }),
    [page, ratingFilter]
  );

  const { data: reviewsPage, isLoading } = useReviews(params);
  const { data: summary } = useReviewSummary();

  const reviews = reviewsPage?.data ?? [];
  const totalPages = reviewsPage?.meta.totalPages ?? 1;

  return (
    <Box>
      <PageHeader
        title="Ratings & Reviews"
        description="See what your customers are saying and respond to their feedback."
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Typography variant="h2" fontWeight={800} color="primary.main">
              {(summary?.avgRating ?? 0).toFixed(1)}
            </Typography>
            <Rating value={summary?.avgRating ?? 0} precision={0.1} readOnly sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Based on {summary?.totalReviews ?? 0} reviews
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary?.ratingBreakdown?.[String(star) as '1' | '2' | '3' | '4' | '5'] ?? 0;
                const total = summary?.totalReviews || 1;
                const percent = (count / total) * 100;
                return (
                  <Stack key={star} direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="body2" sx={{ width: 40 }}>
                      {star} <StarRoundedIcon sx={{ fontSize: 14, mb: '-2px', color: '#FFB238' }} />
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ width: 32, textAlign: 'right' }}>
                      {count}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <TextField
          select
          label="Filter by rating"
          size="small"
          sx={{ minWidth: 180 }}
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
            setPage(1);
          }}
        >
          <MenuItem value="all">All ratings</MenuItem>
          {[5, 4, 3, 2, 1].map((star) => (
            <MenuItem key={star} value={star}>
              {star} stars
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {isLoading ? (
        <LoadingScreen label="Loading reviews…" />
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Customer reviews will appear here once you start receiving orders." />
      ) : (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <Card key={review.id} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar src={review.customerAvatarUrl ?? undefined}>
                    {getInitials(review.customerName)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle2" fontWeight={700}>
                        {review.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.createdAt)}
                      </Typography>
                    </Stack>
                    <Rating value={review.rating} readOnly size="small" sx={{ my: 0.5 }} />
                    {review.foodItems && review.foodItems.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                        {review.foodItems.map((item) => (
                          <Chip key={item} size="small" label={item} variant="outlined" />
                        ))}
                      </Stack>
                    )}
                    {review.comment && <Typography variant="body2">{review.comment}</Typography>}

                    {review.reply ? (
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" fontWeight={700} color="primary.main">
                          Your reply
                        </Typography>
                        <Typography variant="body2">{review.reply}</Typography>
                      </Box>
                    ) : (
                      <ReviewReplyBox reviewId={review.id} />
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
        </Stack>
      )}
    </Box>
  );
}
