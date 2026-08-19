import { Box, Paper } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { WorkingHoursEditor } from '@/components/hours/WorkingHoursEditor';
import { useWorkingHours } from '@/hooks/useRestaurantProfile';

export default function WorkingHoursPage() {
  const { data: workingHours, isLoading } = useWorkingHours();

  return (
    <Box>
      <PageHeader
        title="Working Hours"
        description="Set the days and times your restaurant accepts orders."
      />

      {isLoading || !workingHours ? (
        <LoadingScreen label="Loading working hours…" />
      ) : (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <WorkingHoursEditor workingHours={workingHours} />
        </Paper>
      )}
    </Box>
  );
}
