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
    ListItemIcon,
    useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Face6Icon from '@mui/icons-material/Face6'; // Talking avatar icon for Language Modeling (NLP)
import { MdOutlineSettingsInputComposite } from "react-icons/md"; // Fine-tuning emblem remains
import { PiPipeWrenchFill } from "react-icons/pi";
import { FaBloggerB, FaMoneyBill } from "react-icons/fa";
import { AppContext } from '../Context';

// Glassmorphic Styled Components
const GlassAppBar = styled(AppBar)(({ theme }) => ({
    background: 'rgba(22, 24, 33, 0.90)',
    backdropFilter: 'blur(14px) saturate(150%)',
    borderBottom: `1.5px solid rgba(255,255,255,0.07)`,
    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25), 0 1.5px 0 0 rgba(255,255,255,0.04) !important',
}));

const GlassMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        background: 'rgba(22, 24, 33, 0.98)',
        backdropFilter: 'blur(10px) saturate(120%)',
        color: '#ededed',
        borderRadius: 12,
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.33)',
        border: '1px solid rgba(255,255,255,0.08)'
    }
}));

// Navigation Structure
const navGroups = [
    { text: 'About', icon: <AccountBalanceIcon />, where: '/' },
    {
        text: 'Language Modeling (NLP)',
        icon: <Face6Icon />, // Use Face6Icon for main heading
        children: [
            { text: 'Fine-Tuning', icon: <MdOutlineSettingsInputComposite />, where: '/finetunedmodel' }, // Old icon for fine-tuning
            { text: 'RAG w/ NYT', icon: <PiPipeWrenchFill />, where: '/nytimesmodel' },
        ]
    },
    { text: 'Financial Insights', icon: <FaMoneyBill />, where: '/financemodel' },
    { text: 'Blog', icon: <FaBloggerB />, where: '/blog' },
];

const DashboardFrame = ({ page }) => {
    const { state } = useContext(AppContext) || {};
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
    const [openSubMenuName, setOpenSubMenuName] = useState(null);
    const [desktopSubmenuAnchor, setDesktopSubmenuAnchor] = useState(null);
    const [desktopSubmenuName, setDesktopSubmenuName] = useState(null);

    // Mobile menu handlers
    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
        setSubmenuAnchorEl(null);
        setOpenSubMenuName(null);
    };
    const handleOpenSubmenu = (event, name) => {
        setSubmenuAnchorEl(event.currentTarget);
        setOpenSubMenuName(name);
    };
    const handleCloseSubmenu = () => {
        setSubmenuAnchorEl(null);
        setOpenSubMenuName(null);
    };

    // Desktop submenu handlers
    const handleDesktopSubmenuOpen = (event, name) => {
        setDesktopSubmenuAnchor(event.currentTarget);
        setDesktopSubmenuName(name);
    };
    const handleDesktopSubmenuClose = () => {
        setDesktopSubmenuAnchor(null);
        setDesktopSubmenuName(null);
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #16181c 0%, #23272f 100%)',
            color: '#ededed',
        }}>
            <GlassAppBar position="sticky" elevation={0}>
                <Container maxWidth="xl" disableGutters sx={{ background: 'none', px: 0 }}>
                    <Toolbar variant="dense" sx={{ px: { xs: 1, md: 2 } }}>
                        <Typography
                            variant="h6"
                            noWrap
                            component={Link}
                            to="/"
                            sx={{
                                mr: 3,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                                textShadow: '0 2px 16px rgba(0,0,0,0.20)'
                            }}
                        >
                            THE DATA DOJO
                        </Typography>
                        {/* Mobile hamburger */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="open navigation menu"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <GlassMenu
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
                                sx={{ display: { xs: 'block', md: 'none' } }}
                            >
                                {navGroups.map((item) =>
                                    item.children ? (
                                        <div key={item.text}>
                                            <MenuItem
                                                onClick={(e) => handleOpenSubmenu(e, item.text)}
                                                sx={{ display: 'flex', alignItems: 'center' }}
                                            >
                                                <ListItemIcon>{item.icon}</ListItemIcon>
                                                <Typography textAlign="center">{item.text}</Typography>
                                                <ArrowRightIcon sx={{ ml: 'auto' }} />
                                            </MenuItem>
                                            <GlassMenu
                                                anchorEl={submenuAnchorEl}
                                                open={openSubMenuName === item.text}
                                                onClose={handleCloseSubmenu}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'left',
                                                }}
                                                sx={{ ml: 2 }}
                                            >
                                                {item.children.map((child) => (
                                                    <MenuItem
                                                        key={child.text}
                                                        onClick={handleCloseNavMenu}
                                                        component={Link}
                                                        to={child.where}
                                                    >
                                                        <ListItemIcon>{child.icon}</ListItemIcon>
                                                        <Typography textAlign="center">{child.text}</Typography>
                                                    </MenuItem>
                                                ))}
                                            </GlassMenu>
                                        </div>
                                    ) : (
                                        <MenuItem
                                            key={item.text}
                                            onClick={handleCloseNavMenu}
                                            component={Link}
                                            to={item.where}
                                        >
                                            <ListItemIcon>{item.icon}</ListItemIcon>
                                            <Typography textAlign="center">{item.text}</Typography>
                                        </MenuItem>
                                    )
                                )}
                            </GlassMenu>
                        </Box>
                        {/* Mobile logo/title */}
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
                                textShadow: '0 2px 16px rgba(0,0,0,0.20)'
                            }}
                        >
                            DATA DOJO
                        </Typography>
                        {/* Desktop nav */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', alignItems: 'center' } }}>
                            {navGroups.map((item) =>
                                item.children ? (
                                    <Box
                                        key={item.text}
                                        sx={{ position: 'relative', mx: 1, zIndex: 100 }}
                                        onMouseEnter={(e) => handleDesktopSubmenuOpen(e, item.text)}
                                        onMouseLeave={handleDesktopSubmenuClose}
                                    >
                                        <Button
                                            onMouseEnter={(e) => handleDesktopSubmenuOpen(e, item.text)}
                                            sx={{
                                                my: 1,
                                                color: '#fff',
                                                display: 'block',
                                                mx: 1,
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                borderRadius: 3,
                                                background: desktopSubmenuName === item.text ? 'rgba(255,255,255,0.10)' : 'transparent',
                                                boxShadow: desktopSubmenuName === item.text ? '0 2px 6px 0 rgba(0,0,0,0.14)' : 'none',
                                                transition: 'background 0.2s'
                                            }}
                                            startIcon={item.icon}
                                        >
                                            {item.text}
                                        </Button>
                                        <GlassMenu
                                            anchorEl={desktopSubmenuAnchor}
                                            open={desktopSubmenuName === item.text}
                                            onClose={handleDesktopSubmenuClose}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'left',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'left',
                                            }}
                                            MenuListProps={{
                                                onMouseLeave: handleDesktopSubmenuClose,
                                            }}
                                        >
                                            {item.children.map((child) => (
                                                <MenuItem
                                                    key={child.text}
                                                    onClick={handleDesktopSubmenuClose}
                                                    component={Link}
                                                    to={child.where}
                                                    sx={{
                                                        fontWeight: 500,
                                                        color: '#ededed',
                                                        '&:hover': { background: 'rgba(255,255,255,0.05)' }
                                                    }}
                                                >
                                                    <ListItemIcon>{child.icon}</ListItemIcon>
                                                    <Typography textAlign="center">{child.text}</Typography>
                                                </MenuItem>
                                            ))}
                                        </GlassMenu>
                                    </Box>
                                ) : (
                                    <Button
                                        key={item.text}
                                        onClick={handleCloseNavMenu}
                                        component={Link}
                                        to={item.where}
                                        sx={{
                                            my: 1,
                                            color: '#fff',
                                            display: 'block',
                                            mx: 1,
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            borderRadius: 3,
                                            background: 'transparent',
                                            '&:hover': {
                                                background: 'rgba(255,255,255,0.07)'
                                            },
                                            transition: 'background 0.18s'
                                        }}
                                        startIcon={item.icon}
                                    >
                                        {item.text}
                                    </Button>
                                )
                            )}
                        </Box>
                        <Box sx={{ flexGrow: 0 }}>
                            {/* Place for user/account controls, if needed */}
                        </Box>
                    </Toolbar>
                </Container>
            </GlassAppBar>
            {/* Main content: fill all available space, no padding, no margin */}
            <Box sx={{
                flex: 1,
                minHeight: 0,
                width: '100vw',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                background: 'none',
                p: 0,
                m: 0
            }}>
                {page}
            </Box>
        </Box>
    );
};

export default DashboardFrame;