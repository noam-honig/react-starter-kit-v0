import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Link, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import routes from './Routes';
import { AccountCircle } from '@mui/icons-material';
import { Button, Menu, MenuItem } from '@mui/material';
import { uiTools } from './Utils/FormDialog';
import { SignIn } from './Users/SignIn.controller';
import { AuthContext, RemultContext, useRemult } from './common';
import { Roles } from './Users/Roles';
import { TeacherGroupsPage } from './Home/TeacherGroupsPage';



const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function MainPage() {
  const location = useLocation();
  const remult = useRemult();
  const auth = React.useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const userToken = searchParams.get("token");

  React.useEffect(() => {
    if (userToken) {
      SignIn.validateUserToken(userToken).then(r => {
        if (r.token) {
          auth.setAuthToken(r.token);
        }
      });
    }
  }, [userToken, remult]);

  const allowedRoutes = routes.filter(r => r.allowed === undefined || remult.isAllowed(r.allowed));
  const title = React.useMemo(() => {
    return allowedRoutes.find(r => r.path === location.pathname.substring(1))?.title ?? ''
  }, [location])



  const navigate = useNavigate();
  uiTools.navigate = (element, ...args: any[]) => {
    let r = allowedRoutes.find(x => x.element == element);
    if (r) {
      let path = '/' + r?.path.split('/')[0];
      for (const a of args) {
        path += '/' + a;
      }
      navigate(path);
    }
  }
  uiTools.setAuthToken = token => auth.setAuthToken(token);

  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };


  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const signOut = () => {
    auth.signOut();
    setSearchParams({ token: '' });
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  if (!remult.authenticated()) {

    return (<Button color="inherit"
      onClick={() => new SignIn(remult).show(uiTools)}>
      כניסה
    </Button>)
  }
  if (!remult.isAllowed(Roles.admin)) {
    return <>
      <Typography variant="h6">שלום {remult.user.name}</Typography>
      <TeacherGroupsPage teacherId={remult.user.id} />
      <Button onClick={signOut}>צא</Button>
    </>
  }


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}  >
        <Toolbar variant="dense">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <div>
            {
              !remult.authenticated() && (<>
                <Button color="inherit"
                  onClick={() => new SignIn(remult).show(uiTools)}>
                  כניסה
                </Button>
                
              </>)
            }
            {remult.authenticated() && (<>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>עדכן סיסמה</MenuItem>
                <MenuItem onClick={() => {
                  signOut();
                  handleClose();
                }}>יציאה מהמערכת</MenuItem>
              </Menu>
            </>)}
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {allowedRoutes.map(r => (<ListItem button key={r.path} component={Link} to={"/" + r.path} >
            <ListItemText > {r.title} </ListItemText>
          </ListItem>))}


        </List>

      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Routes>
          {allowedRoutes.map(r => (<Route key={r.path} path={r.path} element={React.createElement(r.element)} />))}
        </Routes>

      </Main>
    </Box>
  );
}
