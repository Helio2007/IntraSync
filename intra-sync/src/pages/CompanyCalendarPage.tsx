import { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Chip, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

const mockEvents = [
  { date: '2024-06-24', title: 'Mbledhje e përgjithshme', type: 'meeting' },
  { date: '2024-06-25', title: 'Event Team Building', type: 'event' },
  { date: '2024-06-28', title: 'Pushim zyrtar', type: 'holiday' },
  { date: '2024-06-24', title: 'Takim me partnerët', type: 'meeting' },
];

const typeColors: Record<string, string> = {
  meeting: 'primary',
  event: 'secondary',
  holiday: 'default',
};

const typeLabels: Record<string, string> = {
  meeting: 'Takim',
  event: 'Event',
  holiday: 'Pushim zyrtar',
};

const CompanyCalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const eventsForDate = mockEvents.filter(e => e.date === formattedDate);

  return (
    <Container maxWidth="md" sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', pt: 6, pb: 6, px: { xs: 1, sm: 0 } }}>
      <Box width={{ xs: '100%', sm: '100%' }}>
        <Typography variant={{ xs: 'h5', sm: 'h4' }} gutterBottom sx={{ fontWeight: 700, mb: 3, color: 'primary.main', textAlign: 'center', fontSize: { xs: 28, sm: 34 } }}>
          Kalendar i Kompanisë
        </Typography>
        <Box mb={4} width="100%">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Zgjidh datën"
              value={selectedDate}
              onChange={setSelectedDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Box>
        <Box width="100%">
          <Typography variant="h6" gutterBottom sx={{ mb: 2, textAlign: 'center', fontSize: { xs: 17, sm: 20 } }}>Eventet për datën: {formattedDate}</Typography>
          <Stack spacing={3}>
            {eventsForDate.length === 0 ? (
              <Card elevation={0} sx={{ p: 3, textAlign: 'center', color: 'text.secondary', bgcolor: 'background.paper' }}>
                Nuk ka evente për këtë datë.
              </Card>
            ) : (
              eventsForDate.map((item, idx) => (
                <Card key={item.title + item.date} elevation={2} sx={{ borderLeft: `6px solid`, borderColor: typeColors[item.type] || 'grey.400', bgcolor: 'background.paper', width: { xs: '100%', sm: '100%' } }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} width="100%">
                      <Typography variant="subtitle1" fontWeight={600} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>{item.title}</Typography>
                    </Box>
                    <Chip
                      label={typeLabels[item.type] || item.type}
                      color={typeColors[item.type] || 'default'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default CompanyCalendarPage; 