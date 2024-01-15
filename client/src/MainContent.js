import React, { useEffect, useState } from "react";

import { alpha, createTheme, getContrastRatio, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import AppBar from "./AppBar.js";
import AppDrawer from "./AppDrawer.js";
import CloseIcon from "@mui/icons-material/Close";
import CardGrid from "./CardGrid.js";
import ExpandableFab from "./ExpandableFab.js";
import Modal from "@mui/material/Modal";
import { IconButton, Typography } from "@mui/material";
import EditLibrary from "./EditLibrary.js";
import axios from "axios";

const customGreenBase = "#00dcff";
const customGreenMain = alpha(customGreenBase, 0.7);

const mdTheme = createTheme({
  palette: {
    customGreen: {
      main: customGreenMain,
      light: alpha(customGreenBase, 0.5),
      dark: alpha(customGreenBase, 0.9),
      contrastText:
        getContrastRatio(customGreenMain, "#fff") > 4.5 ? "#fff" : "#111",
    },
  },
});
const mainStyle = {
  backgroundColor: (theme) =>
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[900],
  flexGrow: 1,
  height: "100vh",
  overflow: "auto",
  paddingTop: "64px",
  paddingRight: "25px"
};
const editLibraryStyle = {
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "500px",
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

export default function MainContent(props) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedLibrary, setSelectedLibrary] = useState("");
  const [newMediaModalOpen, setNewMediaModalOpen] = useState(false);
  const [editLibraryOpen, setEditLibraryOpen] = useState(false);
  const [libraries, setLibraries] = useState([]);

  const updateLibraries = () => {
    axios.get("/library").then((response) => {
      setLibraries(response.data);
    });
  };

  useEffect(() => {
    updateLibraries();
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const openModal = () => {
    setNewMediaModalOpen(true);
  };
  const closeModal = () => {
    setNewMediaModalOpen(false);
  };

  const openEditLibrary = () => {
    setEditLibraryOpen(true);
  };

  const closeEditLibrary = () => {
    setEditLibraryOpen(false);
  };

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          user={props.user}
          setUser={props.setUser}
          userImageUrl={props.userImageUrl}
          setUserImageUrl={props.setUserImageUrl}
          onLogout={props.onLogout}
        />
        <AppDrawer
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          libraries={libraries}
          setLibraries={setLibraries}
          updateLibraries={updateLibraries}
          selectedLibrary={selectedLibrary}
          setSelectedLibrary={setSelectedLibrary}
        />
        <Box
          component="main"
          sx={{
            ...mainStyle,
            display: selectedLibrary.id ? "none" : "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h4">Please select a library.</Typography>
        </Box>
        <Box
          hidden={selectedLibrary.id ? false : true}
          component="main"
          sx={mainStyle}
        >
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4}}>
            <CardGrid
              selectedLibrary={selectedLibrary}
              user={props.user}
              drawerOpen={drawerOpen}
              newMediaModalOpen={newMediaModalOpen}
              closeNewMediaModal={closeModal}
            />
          </Container>
          <ExpandableFab
            openEditLibrary={openEditLibrary}
            openModal={openModal}
          />
        </Box>
      </Box>

      <Modal
        open={editLibraryOpen}
        onClose={closeEditLibrary}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={editLibraryStyle}>
          <IconButton
            onClick={closeEditLibrary}
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
          <Typography variant="h5">Edit Library</Typography>
          <EditLibrary
            library={selectedLibrary}
            setLibrary={setSelectedLibrary}
            updateLibraries={updateLibraries}
            closeModal={closeEditLibrary}
          />
        </Box>
      </Modal>
    </ThemeProvider>
  );
}
