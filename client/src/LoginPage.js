import React, { useState } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Typography,
  Container,
  Box,
  InputAdornment,
  IconButton,
  Modal,
} from "@mui/material";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import CreateAccount from "./CreateAccount";
import axios from "axios";
import ForgotPassword from "./ForgotPassword";

const style = {
  display: "flex",
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

export default function LoginPage(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [errors, setErrors] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    let response = await axios
      .post("/user/login", {
        username,
        password,
      })
      .catch(function (error) {
        console.error(error);
        let errorMessages = [
          <Typography color="error">{error.message}</Typography>,
        ];
        if (error.response.data.errors) {
          errorMessages = error.response.data.errors.map((err) => (
            <Typography color="error">{err.msg}</Typography>
          ));
        } else if (error.response.data.error) {
          let errorMessage = error.response.data.error;
          setErrors([<Typography color="error">{errorMessage}</Typography>]);
        }
      });

    if (response.data) {
      // Reset form fields
      setUsername("");
      setPassword("");

      props.setUser(response.data);
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleOpenNewModal = () => {
    setIsNewModalOpen(true);
  };

  const handleCloseNewModal = () => {
    setIsNewModalOpen(false);
  };

  const handleOpenForgotModal = () => {
    setIsForgotModalOpen(true);
  };

  const handleCloseForgotModal = () => {
    setIsForgotModalOpen(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div>
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "15px" }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlined />
          </Avatar>
        </Box>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={handleTogglePasswordVisibility}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2" onClick={handleOpenForgotModal}>
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2" onClick={handleOpenNewModal}>
                {"Don't have an account?"}
              </Link>
            </Grid>
          </Grid>
        </form>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
          marginTop={"10px"}
        >
          {errors ? errors : null}
        </Box>
        <Modal
          open={isNewModalOpen}
          onClose={handleCloseNewModal}
          aria-labelledby="account-creation-modal"
          aria-describedby="account-creation-modal-description"
        >
          <Box sx={style}>
            <IconButton
              onClick={handleCloseNewModal}
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
            <CreateAccount closeModal={handleCloseNewModal} />
          </Box>
        </Modal>
        <Modal
          open={isForgotModalOpen}
          onClose={handleCloseForgotModal}
          aria-labelledby="account-creation-modal"
          aria-describedby="account-creation-modal-description"
        >
          <Box sx={style}>
            <IconButton
              onClick={handleCloseForgotModal}
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
            <ForgotPassword closeModal={handleCloseForgotModal} />
          </Box>
        </Modal>
      </div>
    </Container>
  );
}
