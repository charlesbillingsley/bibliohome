import React, { useState } from "react";
import { Typography, Container, TextField, Button, Box } from "@mui/material";
import axios from "axios";

export default function ForgotPassword({ closeModal }) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let apiUrl = "/user/resetPassword";
      let payload = {email};
      const resetResponse = await axios.post(apiUrl, payload);

      if (resetResponse) {
        setEmail("");
        setSuccess(true);
      }
    } catch (error) {
      console.error(error);
      setErrors((prevErrors) => {return [...prevErrors, error.message]});
    }
  };

  const handleEmailChange = async (e) => {
    setSuccess(false);
    setErrors([]);
    setEmail(e.target.value);
  }

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
          />
          {success ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center"
              }}
            >
              <Typography variant="h6" color={"#5cb85c"}>Email Sent!</Typography>
            </Box>
          ) : null}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              color: "red",
              textAlign: "center"
            }}
          >
            {errors ? errors : null}
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Reset Password
          </Button>
        </form>
      </div>
    </Container>
  );
}
