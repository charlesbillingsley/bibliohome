import React, { useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { styled } from "@mui/system";
import {
  Avatar,
  Button,
  Card,
  CardMedia,
  Input,
  InputAdornment,
  TextField,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "700px",
  maxHeight: "70%",
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
  p: 4,
};

const FileInput = styled("input")({
  display: "none",
});

const StyledInput = styled(Input)(({ theme }) => ({
  "& .MuiInputBase-input": {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    marginTop: "10px",
  },
  "& .MuiInputBase-root": {
    position: "relative", // Ensure the parent container has a non-static position
    "& input[type='file']": {
      display: "none",
    },
  },
}));

export default function UploadImage(props) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [tmpSrc, setTmpSrc] = useState(
    url || props.type == "book" ? "/noImage.jpg" : "/noUser.png"
  );

  async function upload() {
    let photoPath = null;

    try {
      if (file) {
        // Create a new FormData object
        const formData = new FormData();
        formData.append("image", file);
        formData.append("type", props.type);

        // Send the file to the server for uploading
        const uploadResponse = await axios.post("/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Retrieve the uploaded image path from the server response
        photoPath = uploadResponse.data.imageName;
      } else if (url) {
        // Send the URL to the server for downloading and saving the image
        const saveImageResponse = await axios.post("/image/url", {
          imageUrl: url,
          type: props.type,
        });

        // Retrieve the saved image path from the server response
        photoPath = saveImageResponse.data.imageName;
      }
    } catch (error) {
      console.log("Failed to save/upload the image:", error);
      alert("Failed to save/upload image!");
      return;
    }

    if (photoPath) {
      // Update the item
      let apiUrl = "/" + props.type + "/" + props.item.id + "/update";
      const updateItemResponse = await axios.post(apiUrl, {
        photo: photoPath,
      });

      let updatedItem = updateItemResponse.data.id;
      props.setUrl(tmpSrc);

      // Go ahead and run a clean-up to clear out any old unused images
      const cleanImagesResponse = await axios.post("/image/clean", {
        type: props.type,
      });

      handleClose();
    }
  }

  const handleClose = () => {
    setUrl("");
    setFile(null);
    setTmpSrc("");
    props.onClose();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    // Read the file and set it as the source for the Avatar component
    const reader = new FileReader();
    reader.onload = (e) => {
      setTmpSrc(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUrlChange = (event) => {
    const value = event.target.value;
    setUrl(value);
    setTmpSrc(value);
  }

  return (
    <Modal
      open={props.open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography variant="h5" fontWeight={"bold"} marginBottom={"10px"}>
          {"Upload Image"}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <TextField
            value={url}
            onChange={handleUrlChange}
            label="Image URL"
            sx={{ width: "100%", maxWidth: "500px" }}
          ></TextField>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ width: "100%", maxWidth: "500px", marginTop: "10px" }}
          >
            {" "}
            - OR -
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <FileInput type="file" onChange={handleFileChange} id="upload-file" />
          <StyledInput
            value={file ? file.name : ""}
            onChange={handleFileChange}
            label="Image URL"
            inputProps={{ readOnly: Boolean(file) }}
            endAdornment={
              <InputAdornment position="end">
                <label htmlFor="upload-file">
                  <Button variant="contained" component="span">
                    Browse
                  </Button>
                </label>
              </InputAdornment>
            }
            sx={{ width: "100%", maxWidth: "500px" }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
            gap: "10px",
          }}
        >
          {props.type == "book" ? (
            <Card
              sx={{
                width: 128,
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: 128,
                  height: 196,
                }}
                image={tmpSrc}
                alt={"No image found"}
                onError={(e) => {
                  e.target.src = "/noImage.jpg";
                }}
              />
            </Card>
          ) : null}

          {props.type == "user" ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Avatar
                alt={"X"}
                src={tmpSrc}
                sx={{ width: 80, height: 80 }}
              />
            </Box>
          ) : null}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
            gap: "10px",
          }}
        >
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={upload}
            sx={{ marginRight: "8px" }}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
