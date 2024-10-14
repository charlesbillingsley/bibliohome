import React, { useEffect, useState } from "react";
import axios from "axios";
import "react-phone-input-2/lib/style.css";
import "react-quill/dist/quill.snow.css";
import Box from "@mui/material/Box";
import { Button, Link, TextField, Typography } from "@mui/material";

export default function AppSettings(props) {
  const [emailService, setEmailService] = useState();
  const [emailUsername, setEmailUsername] = useState();
  const [emailPassKey, setEmailPassKey] = useState();
  const [movieApiKey, setMovieApiKey] = useState();
  const [bookApiKey, setBookApiKey] = useState();

  const submit = async () => {
    try {
      let apiUrl = "/appSettings/1/update";
      let payload = {
        emailService,
        emailUsername,
        emailPassKey,
        movieApiKey,
        bookApiKey
      };
      const updateSettingsResponse = await axios.post(apiUrl, payload);
      if (updateSettingsResponse.data.id) {
        props.closeModal();
      }
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  useEffect(() => {
    axios
      .get("/appSettings/1")
      .then(function (response) {
        if (response.data) {
          setEmailService(response.data.emailService || '');
          setEmailUsername(response.data.emailUsername || '');
          setEmailPassKey(response.data.emailPassKey || '');
          setMovieApiKey(response.data.movieApiKey || '');
          setBookApiKey(response.data.bookApiKey || '');
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  return (
    <Box>
      <Typography variant="h4">App Settings</Typography>
      <Typography variant="h6" marginTop="10px">
        Notification Email
      </Typography>
      <Box
        sx={{
          border: "1px solid lightgrey",
          borderRadius: "10px",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <TextField
          label="Service"
          sx={{ marginTop: "10px" }}
          value={emailService}
          onChange={(e) => setEmailService(e.target.value)}
        />
        <TextField
          label="Username"
          sx={{ marginTop: "10px" }}
          value={emailUsername}
          onChange={(e) => setEmailUsername(e.target.value)}
        />
        <TextField
          label="Pass Key"
          sx={{ marginTop: "10px" }}
          value={emailPassKey}
          onChange={(e) => setEmailPassKey(e.target.value)}
        />
      </Box>
      <Typography variant="h6" marginTop="10px">
        TMDB API
      </Typography>
      <Box
        sx={{
          border: "1px solid lightgrey",
          borderRadius: "10px",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Link href="https://developer.themoviedb.org/docs">TMDB API Link</Link>
        <TextField
          label="API Key"
          value={movieApiKey}
          onChange={(e) => setMovieApiKey(e.target.value)}
        />
      </Box>
      <Typography variant="h6" marginTop="10px">
        Google Books API
      </Typography>
      <Box
        sx={{
          border: "1px solid lightgrey",
          borderRadius: "10px",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Link href="https://developers.google.com/books/docs/v1/using">Google Books API Link</Link>
        <TextField
          label="API Key"
          value={bookApiKey}
          onChange={(e) => setBookApiKey(e.target.value)}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "5px",
          marginTop: "10px",
        }}
      >
        <Button variant="contained" onClick={submit}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}
