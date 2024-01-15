import React, { useState } from "react";
import axios from "axios";
import "react-phone-input-2/lib/style.css";
import "react-quill/dist/quill.snow.css";
import Box from "@mui/material/Box";
import { Button, Modal, TextField, Typography } from "@mui/material";
import IconInput from "./IconInput";

const confirmationStyle = {
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  maxWidth: "1000px",
  maxHeight: "50%",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "10px",
  p: 4,
};

export default function EditLibrary(props) {
  const [name, setName] = useState(props.library.name || "");
  const [icon, setIcon] = useState(props.library.icon || "MenuBookRounded");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const openDeleteConfirmation = () => {
    setConfirmationOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setConfirmationOpen(false);
  };

  async function handleConfirmDelete() {
    await deleteLibrary();
  }

  const handleCancelDelete = () => {
    closeDeleteConfirmation(false);
  };

  const deleteLibrary = async () => {
    try {
      const deleteLibraryResponse = await axios.post(
        "library/" + props.library.id + "/delete"
      );
    } catch (error) {
      alert("Failed to delete the library.");
      console.log("Failed to delete the library:", error);
      return;
    }
    closeDeleteConfirmation();
    props.setLibrary("");
    props.updateLibraries();
    props.closeModal();
  }

  const submit = async () => {
    try {
      let apiUrl = "/library/" + props.library.id + "/update";
      let payload = {
        name,
        icon,
      };
      const updateLibraryResponse = await axios.post(apiUrl, payload);

      if (updateLibraryResponse.data.id) {
        props.setLibrary(updateLibraryResponse.data);
        props.updateLibraries();
        props.closeModal();
      }
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <TextField
        label="Library Name"
        sx={{ marginTop: "10px" }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <IconInput
        selectedIcon={icon}
        setSelectedIcon={setIcon}
        sx={{ marginTop: "10px" }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "5px",
          marginTop: "10px",
        }}
      >
        <Button
          variant="outlined"
          color="error"
          onClick={openDeleteConfirmation}
        >
          Delete
        </Button>
        <Button variant="contained" onClick={submit}>
          Submit
        </Button>
      </Box>

      <Modal
        open={confirmationOpen}
        onClose={closeDeleteConfirmation}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={confirmationStyle}>
          <Typography variant="h6" gutterBottom align="center">
            Are you sure you want to delete this library permanently?
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "16px",
              gap: "10px",
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDelete}
              sx={{ marginRight: "8px" }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
