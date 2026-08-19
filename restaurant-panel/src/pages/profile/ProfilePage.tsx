import { useState, type SyntheticEvent } from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { BusinessDetailsForm } from '@/components/profile/BusinessDetailsForm';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';

export default function ProfilePage() {
  const { data: profile, isLoading } = useRestaurantProfile();
  const [tab, setTab] = useState(0);

  function handleTabChange(_: SyntheticEvent, value: number) {
    setTab(value);
  }

  return (
    <Box>
      <PageHeader
        title="Restaurant Profile"
        description="Keep your profile and business details up to date."
      />

      {isLoading || !profile ? (
        <LoadingScreen label="Loading profile…" />
      ) : (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Tab label="Profile" />
            <Tab label="Business Details" />
          </Tabs>

          {tab === 0 && <ProfileForm profile={profile} />}
          {tab === 1 && <BusinessDetailsForm profile={profile} />}
        </Paper>
      )}
    </Box>
  );
}
