import { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Chip, Stack, Button, IconButton, Tooltip, CircularProgress, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import TaskIcon from '@mui/icons-material/Task';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import { getCompanyEvents, CompanyEvent, addCompanyEvent, updateCompanyEvent, deleteCompanyEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { format } from 'date-fns';

const eventTypes = [
  { value: 'meeting', label: 'Takim', icon: <EventIcon color="primary" /> },
  { value: 'task', label: 'Detyrë', icon: <TaskIcon color="secondary" /> },
  { value: 'break', label: 'Pushim', icon: <FreeBreakfastIcon color="action" /> },
];

const typeColors: Record<string, string> = {
  meeting: 'primary',
  task: 'secondary',
  break: 'default',
};

const typeLabels: Record<string, string> = {
  meeting: 'Takim',
  task: 'Detyrë',
  break: 'Pushim',
};

const CompanyCalendarPage = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CompanyEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<CompanyEvent>>({ title: '', date: '', time: '', type: 'meeting' });
  const [submitting, setSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getCompanyEvents(token)
      .then(setEvents)
      .catch(() => setError('Nuk u lexuan eventet e kompanisë!'))
      .finally(() => setLoading(false));
  }, [token]);

  const getTypeIcon = (type: string) => {
    const found = eventTypes.find(e => e.value === type);
    return found ? found.icon : null;
  };

  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setNewEvent({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '', type: 'meeting' });
    setDialogOpen(true);
    setDialogError(null);
  };

  const handleOpenEditDialog = (event: CompanyEvent) => {
    setIsEditing(true);
    setCurrentEvent(event);
    setNewEvent(event);
    setDialogOpen(true);
    setDialogError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewEvent({ title: '', date: '', time: '', type: 'meeting' });
    setCurrentEvent(null);
    setDialogError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleSubmitEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.type) {
      setDialogError('Ju lutem plotësoni të gjitha fushat!');
      return;
    }
    setSubmitting(true);
    setDialogError(null);
    try {
      if (isEditing && currentEvent?._id) {
        await updateCompanyEvent(currentEvent._id, newEvent as CompanyEvent, token!);
      } else {
        await addCompanyEvent(newEvent as CompanyEvent, token!);
      }
      handleCloseDialog();
      // Refresh events
      const updated = await getCompanyEvents(token!);
      setEvents(updated);
    } catch (err: any) {
      setDialogError('Gabim gjatë ruajtjes së eventit!');
      console.error('Gabim gjatë ruajtjes së eventit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('A jeni i sigurt që doni ta fshini këtë event?')) {
      try {
        await deleteCompanyEvent(eventId, token!);
        setEvents(events.filter(e => e._id !== eventId));
      } catch (err) {
        setError('Gabim gjatë fshirjes së eventit!');
        console.error('Gabim gjatë fshirjes së eventit:', err);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', pt: 6, pb: 6, px: { xs: 1, sm: 0 } }}>
      <Box width={{ xs: '100%', sm: '100%' }}>
        <Typography variant={{ xs: 'h5', sm: 'h4' }} gutterBottom sx={{ fontWeight: 700, mb: 3, color: 'primary.main', textAlign: 'center', fontSize: { xs: 28, sm: 34 } }}>
          Kalendar i Kompanisë
        </Typography>
        <Box mb={3} display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
            Shto Event
          </Button>
        </Box>
        <Box width="100%">
          {loading && <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={3}>
            {events.length === 0 && !loading ? (
              <Card elevation={0} sx={{ p: 3, textAlign: 'center', color: 'text.secondary', bgcolor: 'background.paper' }}>
                Nuk ka evente të kompanisë.
              </Card>
            ) : (
              [...events].sort((a, b) => {
                // Sort by date then time
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA.getTime() - dateB.getTime();
              }).map((item, idx) => (
                <Card key={item._id || idx} elevation={2} sx={{ borderLeft: `6px solid`, borderColor: typeColors[item.type] || 'grey.400', bgcolor: 'background.paper', width: { xs: '100%', sm: '100%' } }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box mr={{ xs: 0, sm: 2 }} mb={{ xs: 1, sm: 0 }} display="flex" alignItems="center" justifyContent="center">
                      {getTypeIcon(item.type)}
                    </Box>
                    <Box flex={1} width="100%">
                      <Typography variant="subtitle1" fontWeight={600} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>{item.title}</Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                        <Chip label={item.date} color="default" size="small" sx={{ fontWeight: 600 }} />
                        <Chip label={item.time} color={typeColors[item.type] || 'default'} size="small" sx={{ fontWeight: 600 }} />
                        <Chip label={typeLabels[item.type] || item.type} color={typeColors[item.type] || 'default'} size="small" variant="outlined" />
                      </Box>
                    </Box>
                    {(user?.role === 'admin' || user?.role === 'ceo') && (
                      <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-end' }} width={{ xs: '100%', sm: 'auto' }}>
                        <Tooltip title="Edito" arrow>
                          <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(item)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Fshi" arrow>
                          <IconButton edge="end" aria-label="delete" onClick={() => item._id && handleDeleteEvent(item._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Box>
      </Box>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'Edito Eventin' : 'Shto Event Kompanie'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          {dialogError && <Alert severity="error">{dialogError}</Alert>}
          <TextField
            label="Titulli"
            name="title"
            value={newEvent.title}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            name="date"
            label="Data"
            type="date"
            fullWidth
            variant="standard"
            value={newEvent.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            margin="dense"
            name="time"
            label="Koha"
            type="time"
            fullWidth
            variant="standard"
            value={newEvent.time}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            select
            label="Lloji"
            name="type"
            value={newEvent.type}
            onChange={handleChange}
            fullWidth
          >
            {eventTypes.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anulo</Button>
          <Button onClick={handleSubmitEvent} variant="contained" disabled={submitting}>{submitting ? 'Duke ruajtur...' : 'Ruaj'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompanyCalendarPage; 