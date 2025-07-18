import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../main';
import { useContext, useState } from 'react';
import logoBlack from '../assets/intrasync-logo-black.png';
import logoWhite from '../assets/intrasync-logo-white.png';

const navLinks = [
  { label: 'Login', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Check-In', to: '/checkin' },
  { label: 'Kalendar', to: '/calendar' },
];

const Navbar = () => {
  const location = useLocation();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const handleDrawerToggle = () => setDrawerOpen((prev) => !prev);

  return (
    <Box sx={{ flexGrow: 1, mb: 4 }}>
      <AppBar
        position="sticky"
        elevation={4}
        sx={{
          display: { xs: drawerOpen ? 'none' : 'block', md: 'block' },
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1.5px solid ${theme.palette.divider}`,
          top: 0,
          zIndex: 1201,
          borderRadius: { xs: 3, sm: 4 },
          mx: 'auto',
          maxWidth: 1100,
          mt: 2,
          boxShadow: { xs: 6, sm: 8 },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 }, px: { xs: 1, sm: 3 } }}>
          <Box component={Link} to="/" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src={theme.palette.mode === 'dark' ? logoWhite : logoBlack}
              alt="IntraSync Logo"
              style={{ height: theme.breakpoints.values.xs ? 40 : 60, maxHeight: 60, width: 'auto', transition: 'height 0.2s' }}
            />
          </Box>
          {/* Mobile menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <IconButton
              color="inherit"
              edge="end"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
          {/* Desktop menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                color="primary"
                component={Link}
                to={link.to}
                size="large"
                sx={{
                  fontSize: { xs: 15, sm: 17 },
                  mx: 1,
                  fontWeight: 600,
                  borderRadius: 2,
                  bgcolor: location.pathname === link.to ? theme.palette.action.selected : 'transparent',
                  ':hover': { bgcolor: theme.palette.action.hover },
                }}
                disabled={location.pathname === link.to}
              >
                {link.label}
              </Button>
            ))}
            {!isLoggedIn && (
              <Button color="inherit" component={Link} to="/register">Register</Button>
            )}
            {isLoggedIn && (
              <Button color="inherit" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }}>Logout</Button>
            )}
            <IconButton sx={{ ml: 2 }} onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            bgcolor: theme.palette.mode === 'dark' ? '#232936' : '#f4f6fb',
            color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
            pt: 3,
            px: 2,
          },
        }}
        PaperProps={{ sx: { zIndex: 1301 } }}
        ModalProps={{ keepMounted: true }}
      >
        <List sx={{ width: '100%', p: 0 }}>
          {navLinks.map((link) => (
            <ListItem key={link.to} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={link.to}
                selected={location.pathname === link.to}
                onClick={handleDrawerToggle}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 1.5,
                  bgcolor: location.pathname === link.to ? theme.palette.action.selected : 'transparent',
                  color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                  ':hover': { bgcolor: theme.palette.action.hover },
                }}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontSize: 18, fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2, borderColor: theme.palette.mode === 'dark' ? '#444' : theme.palette.divider }} />
        <Divider sx={{ my: 1, borderColor: theme.palette.mode === 'dark' ? '#444' : theme.palette.divider }} />
        <List>
          {!isLoggedIn && (
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/register" sx={{ justifyContent: 'center', borderRadius: 2, py: 1.5 }}>
                <ListItemText primary="Register" primaryTypographyProps={{ fontSize: 17, fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          )}
          {isLoggedIn && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }} sx={{ justifyContent: 'center', borderRadius: 2, py: 1.5 }}>
                <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 17, fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
        <Divider sx={{ my: 2, borderColor: theme.palette.mode === 'dark' ? '#444' : theme.palette.divider }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={colorMode.toggleColorMode} sx={{ justifyContent: 'center', borderRadius: 2, py: 1.5 }}>
              <ListItemText primary={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'} primaryTypographyProps={{ fontSize: 17, fontWeight: 600 }} />
              {theme.palette.mode === 'dark' ? <Brightness7Icon sx={{ ml: 1 }} /> : <Brightness4Icon sx={{ ml: 1 }} />}
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

export default Navbar; 