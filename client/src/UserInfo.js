import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CloseIcon from "@mui/icons-material/Close";
import {
  Grid,
  ThemeProvider,
  useMediaQuery,
  useTheme,
  createTheme,
  Button,
  IconButton,
  Avatar,
  FormLabel,
} from "@mui/material";
import EditUser from "./EditUser";
import dayjs from "dayjs";
import UploadImage from "./UploadImage";
import axios from "axios";

const style = {
  display: "flex",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "1000px",
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

const editUserStyle = {
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

const inputStyle = {
  marginTop: "10px",
};

const customTheme = createTheme({
  breakpoints: {
    values: {
      xxs: 240,
      xs: 600,
      sm: 750,
      md: 1000,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default function UserInfo(props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);

  const openRemoveConfirmation = () => {
    setConfirmationOpen(true);
  };

  const closeRemoveConfirmation = () => {
    setConfirmationOpen(false);
  };

  async function handleConfirmRemove() {
    await deleteUser();
  }

  const handleCancelRemove = () => {
    closeRemoveConfirmation(false);
  };

  const openImageUpload = () => {
    setUploadOpen(true);
  };

  const closeImageUpload = () => {
    setUploadOpen(false);
  };

  const openEditUser = () => {
    setEditUserOpen(true);
  };

  const closeEditUser = () => {
    setEditUserOpen(false);
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

  async function deleteUser() {
    try {
      const deleteUserResponse = await axios.post(
        "user/" + props.user.id + "/delete"
      );
    } catch (error) {
      alert("Failed to delete the user.");
      console.log("Failed to delete the user:", error);
      return;
    }
    closeRemoveConfirmation();
    props.closeModal();
    props.onLogout();
  }

  return (
    <Modal
      open={props.open}
      onClose={props.closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton
          onClick={props.closeModal}
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
        <ThemeProvider theme={customTheme}>
          <Grid container spacing={2}>
            <Grid item sx={isXs ? { margin: "auto" } : { margin: 0 }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Avatar
                  alt={getUsersName()}
                  src={props.userImageUrl}
                  sx={{ width: 80, height: 80 }}
                />
              </Box>
              <Box sx={{ textAlign: "center", paddingTop: "5px" }}>
                <Button variant="text" size="small" onClick={openImageUpload}>
                  Upload
                </Button>
              </Box>
            </Grid>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="h5" fontWeight={"bold"}>
                  {props.user.username}
                </Typography>
                <Typography variant="h6">
                  {capitalize(props.user.firstName + " " + props.user.lastName)}
                </Typography>
              </Grid>
              <Grid item>
                <Box
                  sx={{
                    border: "1px solid lightgrey",
                    borderRadius: "10px",
                    padding: "8px",
                  }}
                >
                  <Box sx={inputStyle}>
                    <FormLabel>Email: </FormLabel>
                    <Box>
                      <Typography variant="body">
                        {props.user.email ? props.user.email : ""}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={inputStyle}>
                    <FormLabel>Phone Number: </FormLabel>
                    {props.user.phone ? (
                      <PhoneInput
                        inputProps={{
                          readOnly: true,
                        }}
                        buttonStyle={{
                          pointerEvents: "none",
                        }}
                        value={props.user.phone}
                      />
                    ) : null}
                  </Box>
                  {/* <Box sx={inputStyle}>
                    <FormLabel>Role: </FormLabel>
                    <Box>
                      <Typography variant="body">
                        {props.user.role ? props.user.role : ""}
                      </Typography>
                    </Box>
                  </Box> */}
                  <Box sx={inputStyle}>
                    <FormLabel>Birthday: </FormLabel>
                    <Box>
                      <Typography variant="body">
                        {props.user.dateOfBirth
                          ? dayjs(props.user.dateOfBirth).format("MM-DD-YYYY")
                          : ""}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={inputStyle}>
                    <FormLabel>Address: </FormLabel>
                    <Box>
                      <Typography variant="body">
                        {props.user.address ? props.user.address : ""}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item>
                <Box
                  sx={{ display: "flex", justifyContent: "center", gap: "5px" }}
                >
                  <Button variant="outlined" onClick={openEditUser}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={openRemoveConfirmation}
                  >
                    Remove
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </ThemeProvider>
        <Modal
          open={confirmationOpen}
          onClose={closeRemoveConfirmation}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={confirmationStyle}>
            <Typography variant="h6" gutterBottom align="center">
              Are you sure you want to delete this user permanently?
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
                onClick={handleCancelRemove}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmRemove}
                sx={{ marginRight: "8px" }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={editUserOpen}
          onClose={closeEditUser}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={editUserStyle}>
            <IconButton
              onClick={closeEditUser}
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
            <Typography variant="h5">Edit User</Typography>
            <EditUser
              user={props.user}
              setUser={props.setUser}
              closeModal={closeEditUser}
            />
          </Box>
        </Modal>
        <UploadImage
          type={"user"}
          open={uploadOpen}
          onClose={closeImageUpload}
          item={props.user}
          setUrl={props.setUserImageUrl}
        />
      </Box>
    </Modal>
  );
}
