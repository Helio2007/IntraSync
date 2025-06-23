import { Container, Typography, List, ListItem, ListItemText, Divider, Box, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Snackbar, Card, CardContent, Chip, Stack, Tooltip, Fade, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import TaskIcon from '@mui/icons-material/Task';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import { getEvents, addEvent, updateEvent, deleteEvent, Event as EventType } from '../services/eventService';

const eventTypes = [
  { value: 'meeting', label: 'Takim', icon: <EventIcon color="primary" /> },
  { value: 'task', label: 'Detyrë', icon: <TaskIcon color="secondary" /> },
  { value: 'break', label: 'Pushim', icon: <FreeBreakfastIcon color="action" /> },
];

const typePriority: Record<string, number> = { meeting: 1, task: 2, break: 3 };

function parseTimeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const DashboardPage = () => {
  const [agenda, setAgenda] = useState<EventType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<EventType>({ title: '', time: '', type: 'meeting', status: 'pending' });
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from backend on mount
  useEffect(() => {
    setLoading(true);
    getEvents()
      .then(events => setAgenda(events))
      .catch(() => setError('Nuk u lexuan eventet nga serveri!'))
      .finally(() => setLoading(false));
  }, []);

  // Njoftim automatik për evente afër (10 min larg)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const nextEvent = agenda.find(e => e.status === 'pending' && parseTimeToMinutes(e.time) - nowMinutes <= 10 && parseTimeToMinutes(e.time) - nowMinutes > 0);
      if (nextEvent) {
        setNotification(`${nextEvent.type === 'meeting' ? 'Takimi' : nextEvent.type === 'task' ? 'Detyra' : 'Pushimi'} "${nextEvent.title}" fillon pas ${parseTimeToMinutes(nextEvent.time) - nowMinutes} minutash!`);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [agenda]);

  const handleOpenDialog = (idx?: number) => {
    if (typeof idx === 'number') {
      setEditIndex(idx);
      setNewEvent(agenda[idx]);
    } else {
      setEditIndex(null);
      setNewEvent({ title: '', time: '', type: 'meeting', status: 'pending' });
    }
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewEvent({ title: '', time: '', type: 'meeting', status: 'pending' });
    setEditIndex(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };
  const handleAddOrEditEvent = async () => {
    if (newEvent.title && newEvent.time) {
      setLoading(true);
      try {
        if (editIndex !== null && agenda[editIndex]._id) {
          const updated = await updateEvent(agenda[editIndex]._id, newEvent);
          setAgenda(prev => prev.map((ev, i) => i === editIndex ? updated : ev));
          setNotification('Eventi u përditësua me sukses!');
        } else {
          const added = await addEvent(newEvent);
          setAgenda(prev => [...prev, added]);
          setNotification('Eventi u shtua me sukses!');
        }
        handleCloseDialog();
      } catch {
        setError('Gabim gjatë ruajtjes së eventit!');
      } finally {
        setLoading(false);
      }
    }
  };
  const handleDeleteEvent = async (idx: number) => {
    if (!agenda[idx]._id) return;
    setLoading(true);
    try {
      await deleteEvent(agenda[idx]._id!);
      setAgenda(prev => prev.filter((_, i) => i !== idx));
      setNotification('Eventi u fshi me sukses!');
    } catch {
      setError('Gabim gjatë fshirjes së eventit!');
    } finally {
      setLoading(false);
    }
  };
  const handleCompleteEvent = async (idx: number) => {
    if (!agenda[idx]._id) return;
    setLoading(true);
    try {
      const updated = await updateEvent(agenda[idx]._id!, { ...agenda[idx], status: 'complete' });
      setAgenda(prev => prev.map((ev, i) => i === idx ? updated : ev));
      setNotification(`Urime! Përfundove "${updated.title}".`);
    } catch {
      setError('Gabim gjatë përfundimit të eventit!');
    } finally {
      setLoading(false);
    }
  };

  // Filtrim & renditje: pending lart, pastaj sipas kohës, pastaj tipit
  const sortedAgenda = [...agenda].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    const aMinutes = parseTimeToMinutes(a.time);
    const bMinutes = parseTimeToMinutes(b.time);
    if (aMinutes !== bMinutes) return aMinutes - bMinutes;
    return typePriority[a.type] - typePriority[b.type];
  });

  const getTypeIcon = (type: string) => {
    const found = eventTypes.find(e => e.value === type);
    return found ? found.icon : null;
  };

  const getTypeColor = (type: string) => {
    if (type === 'meeting') return 'primary';
    if (type === 'task') return 'secondary';
    return 'default';
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 0 } }}>
      <Box width={{ xs: '100%', sm: '100%' }}>
        <Typography variant={{ xs: 'h5', sm: 'h4' }} gutterBottom sx={{ fontWeight: 700, mb: 3, textAlign: 'center', fontSize: { xs: 28, sm: 34 } }}>Dashboard</Typography>
        <Typography mb={4} textAlign="center" sx={{ fontSize: { xs: 15, sm: 16 } }}>Mirësevini në IntraSync! Këtu do të shfaqen axhenda, njoftime dhe funksionalitete të tjera.</Typography>
        <Box>
          {loading && <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} mb={2} gap={2}>
            <Typography variant="h6" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>Axhenda e Ditës</Typography>
            <Button variant="contained" size="large" onClick={() => handleOpenDialog()} sx={{ borderRadius: 3, fontWeight: 600 }} fullWidth={true}>
              Shto Event
            </Button>
          </Box>
          <Stack spacing={3}>
            {sortedAgenda.length === 0 && (
              <Card elevation={0} sx={{ p: 3, textAlign: 'center', color: 'text.secondary', bgcolor: 'background.paper' }}>
                Nuk ka evente për sot. Shto një event të ri!
              </Card>
            )}
            {sortedAgenda.map((item, idx) => (
              <Fade in timeout={400} key={item.time + item.title}>
                <Card
                  elevation={item.status === 'pending' ? 3 : 0}
                  sx={{
                    bgcolor: item.status === 'complete' ? '#f0f0f0' : 'background.paper',
                    borderLeft: `6px solid ${item.type === 'meeting' ? '#1976d2' : item.type === 'task' ? '#90caf9' : '#bdbdbd'}`,
                    transition: 'box-shadow 0.2s, background 0.2s',
                    ':hover': { boxShadow: 6, bgcolor: '#f5faff' },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box mr={{ xs: 0, sm: 2 }} mb={{ xs: 1, sm: 0 }} display="flex" alignItems="center" justifyContent="center">
                      {getTypeIcon(item.type)}
                    </Box>
                    <Box flex={1} width="100%">
                      <Typography variant="subtitle1" sx={item.status === 'complete' ? { textDecoration: 'line-through', color: '#888', textAlign: { xs: 'center', sm: 'left' } } : { fontWeight: 600, textAlign: { xs: 'center', sm: 'left' } }}>
                        {item.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                        <Chip
                          label={item.time}
                          color={getTypeColor(item.type)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip
                          label={eventTypes.find(e => e.value === item.type)?.label}
                          color={getTypeColor(item.type)}
                          size="small"
                          variant="outlined"
                        />
                        {item.status === 'complete' && (
                          <Chip label="Përfunduar" color="success" size="small" />
                        )}
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-end' }} width={{ xs: '100%', sm: 'auto' }}>
                      {item.status === 'pending' && (
                        <Tooltip title="Përfundo" arrow>
                          <IconButton edge="end" aria-label="complete" color="success" onClick={() => handleCompleteEvent(agenda.indexOf(item))}>
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edito" arrow>
                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(agenda.indexOf(item))}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Fshi" arrow>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEvent(agenda.indexOf(item))}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Stack>
        </Box>
        <Snackbar
          open={!!notification}
          autoHideDuration={4000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {notification && <Alert severity="success" sx={{ width: '100%' }}>{notification}</Alert>}
        </Snackbar>
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>{editIndex !== null ? 'Edito Eventin' : 'Shto Event të Ri'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
            <TextField
              label="Titulli"
              name="title"
              value={newEvent.title}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Ora (p.sh. 14:00)"
              name="time"
              value={newEvent.time}
              onChange={handleChange}
              fullWidth
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
            <Button onClick={handleAddOrEditEvent} variant="contained">{editIndex !== null ? 'Ruaj Ndryshimet' : 'Shto'}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default DashboardPage; 