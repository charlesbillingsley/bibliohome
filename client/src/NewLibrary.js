import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import axios from "axios";
import { FormControl, FormLabel } from "@mui/material";
import IconInput from "./IconInput";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "10px",
  p: 4,
};

export default function NewLibrary({ open, closeModal, updateLibraries }) {
  const [newLibraryName, setNewLibraryName] = useState("");
  const [newLibraryIcon, setNewLibraryIcon] = useState("MenuBookRounded");
  const [libraryNameError, setLibraryNameError] = useState("");

  async function createLibrary() {
    console.log("Creating Library");
    return axios
      .post("/library", {
        name: newLibraryName,
        icon: newLibraryIcon
      })
      .catch(function (error) {
        setLibraryNameError(error.message);
      });
  }

  const submit = async (req, res) => {
    // Validate
    var errored = false;
    setLibraryNameError("");

    if (!newLibraryName) {
      setLibraryNameError("This field is required.");
      errored = true;
    }

    // Create Library
    if (!errored) {
      const libraryResponse = await createLibrary();
    }

    if (!errored && !libraryNameError) {
      updateLibraries();
      closeModal();
    }
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Create New Library
        </Typography>
        <Box sx={{ pt: 3 }} display="flex" justifyContent="center">
          <FormControl style={{ gap: 20 }}>
            <TextField
              label="Library Name"
              helperText={libraryNameError}
              error={libraryNameError.length > 0}
              value={newLibraryName}
              onChange={(e) => setNewLibraryName(e.target.value)}
            />
            <IconInput
              selectedIcon={newLibraryIcon}
              setSelectedIcon={setNewLibraryIcon}
            />
            <Button variant="contained" onClick={submit}>
              Submit
            </Button>
          </FormControl>
        </Box>
      </Box>
    </Modal>
  );
}
