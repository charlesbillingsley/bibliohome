import React, { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Box from "@mui/material/Box";
import { Button, FormLabel, MenuItem, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AuthorInput from "./AuthorInput";
import GenreInput from "./GenreInput";
import SeriesInput from "./SeriesInput";

export default function EditBook(props) {
  const [title, setTitle] = useState(props.mediaInfo.title);
  const [subtitle, setSubtitle] = useState(props.mediaInfo.subtitle);
  const [isbn10, setIsbn10] = useState(props.mediaInfo.isbn10);
  const [isbn13, setIsbn13] = useState(props.mediaInfo.isbn13);
  const [description, setDescription] = useState(props.mediaInfo.description);
  const [publisher, setPublisher] = useState(props.mediaInfo.publisher);
  const [publishedDate, setPublishedDate] = useState(
    dayjs(props.mediaInfo.publishedDate)
  );
  const [pageCount, setPageCount] = useState(props.mediaInfo.pageCount);
  const [binding, setBinding] = useState(props.mediaInfo.binding || "");
  const [numberOfCopies, setNumberOfCopies] = useState(
    props.mediaInstance.numberOfCopies || 0
  );
  const [authors, setAuthors] = useState(props.mediaInfo.authors);
  const [genres, setGenres] = useState(props.mediaInfo.bookGenres);
  const [series, setSeries] = useState(props.mediaInfo.series);
  const [orderNumber, setOrderNumber] = useState(
    props.mediaInfo.series[0]?.BookSeries.orderNumber
  );

  const handleAuthorsChange = (updatedAuthors) => {
    setAuthors(updatedAuthors);
  };

  const handleGenresChange = (updatedGenres) => {
    setGenres(updatedGenres);
  };

  const handleSeriesChange = (updatedSeries) => {
    setSeries(updatedSeries);
  };

  const submit = async () => {
    try {
      let apiUrl = "/book/" + props.mediaInfo.id + "/update";
      let payload = {
        title,
        authors,
        isbn10,
        isbn13,
        genres,
        subtitle,
        description,
        pageCount,
        binding,
        series,
        orderNumber,
        publisher,
        publishedDate: dayjs(publishedDate).format("YYYY-MM-DD"),
      };
      const updateBookResponse = await axios.post(apiUrl, payload);
      if (updateBookResponse.data.id) {
        props.setMediaInfo(updateBookResponse.data);
      }

      let instanceUrl = "/bookInstance/" + props.mediaInstance.id + "/update";
      const saveBookInstanceResponse = await axios.post(instanceUrl, {
        numberOfCopies: numberOfCopies,
      });

      if (saveBookInstanceResponse.data.id) {
        props.updateMediaInstance(saveBookInstanceResponse.data);
      }

      if (updateBookResponse.data.id && saveBookInstanceResponse.data.id) {
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
          label="ISBN 10"
          sx={{ marginTop: "10px", width: "50%" }}
          value={isbn10}
          onChange={(e) => setIsbn10(e.target.value)}
        />
        <TextField
          label="ISBN 13"
          sx={{ marginTop: "10px", width: "50%" }}
          value={isbn13}
          onChange={(e) => setIsbn13(e.target.value)}
        />
      </Box>

      <AuthorInput
        initialAuthors={authors}
        onAuthorsChange={handleAuthorsChange}
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

      <TextField
        label="Publisher"
        sx={{ marginTop: "10px" }}
        value={publisher}
        onChange={(e) => setPublisher(e.target.value)}
      />

      <DatePicker
        label="Date Published"
        sx={{ marginTop: "10px" }}
        value={publishedDate}
        onChange={(e) => setPublishedDate(e)}
      />

      <TextField
        label="Page Count"
        sx={{ marginTop: "10px" }}
        type="number"
        value={pageCount}
        onChange={(e) => setPageCount(e.target.value)}
      />

      <TextField
        sx={{ marginTop: "10px" }}
        value={binding}
        label="Binding"
        select
        onChange={(e) => setBinding(e.target.value)}
      >
        <MenuItem value={"paperback"}>Paperback</MenuItem>
        <MenuItem value={"hardcover"}>Hardcover</MenuItem>
      </TextField>

      <TextField
        label="Number Of Copies"
        sx={{ marginTop: "10px" }}
        type="number"
        value={numberOfCopies}
        onChange={(e) => setNumberOfCopies(e.target.value)}
      />

      <SeriesInput initialSeries={series} onSeriesChange={handleSeriesChange} />

      <TextField
        label="Number in Series"
        sx={{ marginTop: "10px" }}
        type="number"
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value)}
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
