import { useContext, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Button,
    Container,
    ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { MdOutlineSettingsInputComposite } from "react-icons/md";
import { PiPipeWrenchFill } from "react-icons/pi";
import { FaBloggerB, FaInstagram, FaGithub } from "react-icons/fa";

import { AppContext } from 'Context';

const pages = [
    { text: 'About', icon: <AccountBalanceIcon />, where: '/' },
    { text: 'Fine-Tuned Model', icon: <MdOutlineSettingsInputComposite />, where: '/finetunedmodel' },
    { text: 'RAG Model w/ NYT', icon: <PiPipeWrenchFill />, where: '/nytimesmodel' },
    { text: 'Blog', icon: <FaBloggerB />, where: '/blog' },
];

const DashboardFrame = ({ page }) => {
  const { state } = useContext(AppContext);
  const theme = useTheme();
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ background: theme.palette.background.default, boxShadow: 'none', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="xl">
          <Toolbar variant="dense">
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              THE DATA DOJO
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.text} onClick={handleCloseNavMenu} component={Link} to={page.where}>
                    <ListItemIcon>{page.icon}</ListItemIcon>
                    <Typography textAlign="center">{page.text}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              DATA DOJO
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.text}
                  onClick={handleCloseNavMenu}
                  component={Link}
                  to={page.where}
                  sx={{ my: 1, color: 'white', display: 'block', mx: 1 }}
                  startIcon={page.icon}
                >
                  {page.text}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
                <Button variant='outlined' component={Link} to='/contact' size="small">
                    Get In Touch
                </Button>
                <IconButton
                    component="a" 
                    href="https://www.instagram.com/theamateurdoghandler"
                    target="_blank"
                    color="inherit"
                    sx={{ ml: 1 }}
                >
                    <FaInstagram />
                </IconButton>
                <IconButton
                    component="a" 
                    href="https://www.github.com/doctorofdata"
                    target="_blank"
                    color="inherit"
                    sx={{ ml: 1 }}
                >
                    <FaGithub />
                </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1}}>
        {page}
      </Box>
    </Box>
  );
}

export default DashboardFrame;