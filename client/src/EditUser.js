import React, { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "react-quill/dist/quill.snow.css";
import Box from "@mui/material/Box";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function EditUser(props) {
  const [username, setUsername] = useState(props.user.username || "");
  const [firstName, setFirstName] = useState(props.user.firstName || "");
  const [lastName, setLastName] = useState(props.user.lastName || "");
  const [email, setEmail] = useState(props.user.email || "");
  const [address, setAddress] = useState(props.user.address || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    props.user.dateOfBirth ? dayjs(props.user.dateOfBirth) : null
  );
  const [phone, setPhone] = useState(props.user.phone || "");
  const [role, setRole] = useState(props.user.role || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const submit = async () => {
    try {
      let apiUrl = "/user/" + props.user.id + "/update";
      let payload = {
        username,
        firstName,
        lastName,
        email,
        address,
        dateOfBirth: dateOfBirth
          ? dayjs(dateOfBirth).format("YYYY-MM-DD")
          : null,
        phone,
        role,
        password,
      };
      const updateUserResponse = await axios.post(apiUrl, payload);

      if (updateUserResponse.data.id) {
        props.setUser(updateUserResponse.data);
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
        label="Username"
        sx={{ marginTop: "10px" }}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <Box sx={{ display: "flex", gap: "10px" }}>
        <TextField
          label="First Name"
          sx={{ marginTop: "10px", width: "50%" }}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          label="Last Name"
          sx={{ marginTop: "10px", width: "50%" }}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </Box>

      <TextField
        label="Email"
        sx={{ marginTop: "10px" }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="Address"
        sx={{ marginTop: "10px" }}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <DatePicker
        label="Birthday"
        sx={{ marginTop: "10px" }}
        value={dateOfBirth}
        onChange={(e) => {
          setDateOfBirth(e);
        }}
        disableFuture
      />

      <Box sx={{ marginTop: "10px" }}>
        <PhoneInput
          country="us" // Set the country to the desired default country
          value={phone}
          onChange={(value) => setPhone(value)}
          inputStyle={{
            width: "100%",
            fontSize: "16px",
            height: "3.5em",
            paddingLeft: "60px",
          }}
          buttonStyle={{ padding: "5px" }}
        />
      </Box>

      <TextField
        sx={{ marginTop: "10px" }}
        fullWidth
        name="password"
        label="New Password"
        type={showPassword ? "text" : "password"}
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end" onClick={handleTogglePasswordVisibility}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

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
