import React from 'react';
import { List, ListItem, ListItemText, Card, CardContent, Typography, Box } from '@mui/material';

const mockNotifications = [
  { title: 'Njoftim 1', message: 'Takimi i stafit në orën 10:00.' },
  { title: 'Njoftim 2', message: 'Kujtesë: Plotësoni raportin ditor.' },
  { title: 'Njoftim 3', message: 'Mirësevini në IntraSync!' },
];

const NotificationsPage: React.FC = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
    <Card sx={{ minWidth: 350 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Njoftimet
        </Typography>
        <List>
          {mockNotifications.map((notif, idx) => (
            <ListItem key={idx} divider>
              <ListItemText
                primary={notif.title}
                secondary={notif.message}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  </Box>
);

export default NotificationsPage; 