import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Box,
  ListItem,
  Menu,
  MenuItem,
  Modal,
  Tooltip,
} from "@mui/material";
import UserInfo from "./UserInfo";
import AppSettings from "./AppSettings";

const drawerWidth = 240;

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const settingsStyle = {
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "700px",
  maxHeight: "90%",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "10px",
  p: 4,
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#888",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#555",
  },
};

export default function AppBar(props) {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [appSettingsOpen, setAppSettingsOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const closeUserProfile = () => {
    setUserProfileOpen(false);
  };

  const openUserProfile = () => {
    setUserProfileOpen(true);
    handleCloseUserMenu();
  };

  const closeAppSettings = () => {
    setAppSettingsOpen(false);
  };

  const openAppSettings = () => {
    setAppSettingsOpen(true);
  };

  function capitalize(str) {
    return str.replace(/\b\w/g, (match) => match.toUpperCase());
  }

  const getUsersName = () => {
    let usersName = capitalize(props.user.username);
    if (props.user.firstName && props.user.lastName) {
      usersName = capitalize(props.user.firstName + " " + props.user.lastName);
    }

    return usersName;
  };

  return (
    <StyledAppBar position="absolute" open={props.drawerOpen}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={props.toggleDrawer}
          sx={{
            ...(props.drawerOpen && { display: "none" }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          align="left"
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1 }}
        >
          Bibliohome
        </Typography>
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={getUsersName()} src={props.userImageUrl} />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <ListItem sx={{ textDecoration: "underline" }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {getUsersName()}
              </Typography>
            </ListItem>
            <MenuItem onClick={openUserProfile}>
              <Typography textAlign="center">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={openAppSettings}>
              <Typography textAlign="center">Settings</Typography>
            </MenuItem>
            <MenuItem onClick={props.onLogout}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
        <UserInfo
          open={userProfileOpen}
          closeModal={closeUserProfile}
          onLogout={props.onLogout}
          user={props.user}
          setUser={props.setUser}
          userImageUrl={props.userImageUrl}
          setUserImageUrl={props.setUserImageUrl}
        />
        <Modal
          open={appSettingsOpen}
          onClose={closeAppSettings}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={settingsStyle}>
            <IconButton
              onClick={closeAppSettings}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                m: 1,
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>
            <AppSettings closeModal={closeAppSettings} />
          </Box>
        </Modal>
      </Toolbar>
    </StyledAppBar>
  );
}
