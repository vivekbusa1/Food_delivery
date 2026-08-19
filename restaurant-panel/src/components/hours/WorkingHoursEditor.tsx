import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { WEEK_DAYS } from '@/utils/constants';
import { useUpdateWorkingHours } from '@/hooks/useRestaurantProfile';
import type { WorkingHourDay, WorkingHours as WorkingHoursType } from '@/types';

interface WorkingHoursEditorProps {
  workingHours: WorkingHoursType;
}

function buildDefaultHours(existing: WorkingHoursType): WorkingHourDay[] {
  return WEEK_DAYS.map((day) => {
    const found = existing.find((entry) => entry.day === day.key);
    return (
      found ?? {
        day: day.key as WorkingHourDay['day'],
        isOpen: false,
        slots: [{ openTime: '09:00', closeTime: '22:00' }],
      }
    );
  });
}

export function WorkingHoursEditor({ workingHours }: WorkingHoursEditorProps) {
  const [days, setDays] = useState<WorkingHourDay[]>(() => buildDefaultHours(workingHours));
  const updateWorkingHours = useUpdateWorkingHours();

  useEffect(() => {
    setDays(buildDefaultHours(workingHours));
  }, [workingHours]);

  function toggleDay(index: number, isOpen: boolean) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, isOpen } : d)));
  }

  function updateSlot(dayIndex: number, slotIndex: number, key: 'openTime' | 'closeTime', value: string) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              slots: d.slots.map((slot, si) => (si === slotIndex ? { ...slot, [key]: value } : slot)),
            }
          : d
      )
    );
  }

  function addSlot(dayIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, slots: [...d.slots, { openTime: '09:00', closeTime: '22:00' }] } : d
      )
    );
  }

  function removeSlot(dayIndex: number, slotIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, slots: d.slots.filter((_, si) => si !== slotIndex) } : d
      )
    );
  }

  function copyToAllDays(dayIndex: number) {
    const source = days[dayIndex];
    setDays((prev) => prev.map((d) => ({ ...d, isOpen: source.isOpen, slots: source.slots.map((s) => ({ ...s })) })));
  }

  function handleSave() {
    updateWorkingHours.mutate(days);
  }

  return (
    <Box>
      <Stack spacing={2}>
        {days.map((day, dayIndex) => (
          <Paper key={day.day} variant="outlined" sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ mb: day.isOpen ? 2 : 0 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Switch checked={day.isOpen} onChange={(_, checked) => toggleDay(dayIndex, checked)} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: 'capitalize', minWidth: 100 }}>
                  {day.day}
                </Typography>
              </Stack>
              {day.isOpen && (
                <Button
                  size="small"
                  startIcon={<ContentCopyRoundedIcon fontSize="small" />}
                  onClick={() => copyToAllDays(dayIndex)}
                >
                  Copy to all days
                </Button>
              )}
            </Stack>

            {day.isOpen && (
              <Stack spacing={1.5}>
                {day.slots.map((slot, slotIndex) => (
                  <Stack key={slotIndex} direction="row" spacing={1.5} alignItems="center">
                    <TextField
                      label="Opens"
                      type="time"
                      size="small"
                      value={slot.openTime}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'openTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Typography color="text.secondary">to</Typography>
                    <TextField
                      label="Closes"
                      type="time"
                      size="small"
                      value={slot.closeTime}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'closeTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      disabled={day.slots.length === 1}
                      onClick={() => removeSlot(dayIndex, slotIndex)}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  size="small"
                  variant="text"
                  startIcon={<AddRoundedIcon fontSize="small" />}
                  onClick={() => addSlot(dayIndex)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add another slot
                </Button>
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="contained" onClick={handleSave} disabled={updateWorkingHours.isPending}>
          {updateWorkingHours.isPending ? 'Saving…' : 'Save working hours'}
        </Button>
      </Stack>
    </Box>
  );
}
