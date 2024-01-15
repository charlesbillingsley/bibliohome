import React, { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Box from "@mui/material/Box";
import { Button, FormLabel, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ProductionCompanyInput from "./ProductionCompanyInput";
import GenreInput from "./GenreInput";

export default function EditMovie(props) {
  const [title, setTitle] = useState(props.mediaInfo.title);
  const [subtitle, setSubtitle] = useState(props.mediaInfo.subtitle);
  const [upc, setUpc] = useState(props.mediaInfo.upc);
  const [description, setDescription] = useState(props.mediaInfo.description);
  const [releaseDate, setReleaseDate] = useState(
    dayjs(props.mediaInfo.releaseDate)
  );
  const [runtime, setRuntime] = useState(props.mediaInfo.runtime);
  const [budget, setBudget] = useState(props.mediaInfo.budget);
  const [revenue, setRevenue] = useState(props.mediaInfo.revenue);
  const [productionCompanies, setProductionCompanies] = useState(
    props.mediaInfo.productionCompanies
  );
  const [genres, setGenres] = useState(props.mediaInfo.movieGenres);

  const handleProductionCompaniesChange = (updatedProductionCompanies) => {
    setProductionCompanies(updatedProductionCompanies);
  };

  const handleGenresChange = (updatedGenres) => {
    setGenres(updatedGenres);
  };

  const submit = async () => {
    try {
      let apiUrl = "/movie/" + props.mediaInfo.id + "/update";
      let payload = {
        title,
        subtitle,
        upc,
        productionCompanies,
        description,
        releaseDate: dayjs(releaseDate).format("YYYY-MM-DD"),
        runtime,
        budget,
        revenue,
        genres,
      };
      const updateMovieResponse = await axios.post(apiUrl, payload);
      if (updateMovieResponse.data.id) {
        console.log(updateMovieResponse.data)
        props.setMediaInfo(updateMovieResponse.data);
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
        label="Title"
        sx={{ marginTop: "10px" }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <TextField
        label="Subtitle"
        sx={{ marginTop: "10px" }}
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
      />

      <Box sx={{ display: "flex", gap: "10px" }}>
        <TextField
          label="UPC"
          sx={{ marginTop: "10px", width: "50%" }}
          value={upc}
          onChange={(e) => setUpc(e.target.value)}
        />
      </Box>

      <ProductionCompanyInput
        initialProductionCompanies={productionCompanies}
        onProductionCompaniesChange={handleProductionCompaniesChange}
      />

      <Box
        sx={{
          marginTop: "10px",
          position: "relative",
          border: "1px solid #bfbfbf",
          borderRadius: "4px",
          padding: "10px",
          ".ql-editor": {
            minHeight: "100px",
            maxHeight: "250px",
            overflow: "auto",
          },
          ".ql-container": {
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
          },
          ".ql-toolbar": {
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          },
        }}
      >
        <FormLabel
          sx={{
            position: "absolute",
            top: "-8px",
            left: "8px",
            backgroundColor: "#fff",
            padding: "0 4px",
            fontSize: "12px",
          }}
        >
          Description
        </FormLabel>
        <ReactQuill value={description} onChange={setDescription} />
      </Box>

      <DatePicker
        label="Date Released"
        sx={{ marginTop: "10px" }}
        value={releaseDate}
        onChange={(e) => setReleaseDate(e.target.value)}
      />

      <TextField
        label="Runtime (minutes)"
        sx={{ marginTop: "10px" }}
        type="number"
        value={runtime}
        onChange={(e) => setRuntime(e.target.value)}
      />

      <TextField
        label="Budget"
        sx={{ marginTop: "10px" }}
        type="number"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />

      <TextField
        label="Revenue"
        sx={{ marginTop: "10px" }}
        type="number"
        value={revenue}
        onChange={(e) => setRevenue(e.target.value)}
      />

      <GenreInput initialGenres={genres} onGenresChange={handleGenresChange} />

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
