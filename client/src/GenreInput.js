import React, { useEffect, useState } from "react";
import axios from "axios";
import { Autocomplete, TextField, Box, Chip } from "@mui/material";

export default function GenreInput({ initialGenres, onGenresChange }) {
  const [genreInput, setGenreInput] = useState("");
  const [searchedGenres, setSearchedGenres] = useState([]);
  const [debouncedGenreInput, setDebouncedGenreInput] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedGenreInput(genreInput);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [genreInput]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          `/genre/search?name=${debouncedGenreInput}`
        );
        const fetchedGenres = response.data;
        const filteredGenres = filterGenres(fetchedGenres);
        setSearchedGenres(filteredGenres);
      } catch (error) {
        console.error(error);
      }
    };

    if (debouncedGenreInput) {
      fetchGenres();
    } else {
      setSearchedGenres([]);
    }
  }, [debouncedGenreInput]);

  const filterGenres = (genres) => {
    const filteredGenres = genres.filter(
      (genre) => !initialGenres.some((tempGenre) => tempGenre.id === genre.id)
    );

    return filteredGenres.map((genre) => ({
      ...genre,
      label: genre.path,
    }));
  };

  const handleGenreInput = (event, newInputValue) => {
    setGenreInput(newInputValue);
  };

  const handleRemoveGenre = (genre) => {
    const updatedGenres = initialGenres.filter(
      (tempGenre) => tempGenre.id !== genre.id
    );
    onGenresChange(updatedGenres);
  };

  const handleAddGenre = (event, selectedGenres, reason) => {
    if (reason === "clear") {
      onGenresChange([]);
      setSearchedGenres([]);
    } else if (selectedGenres.length) {
      const newGenre = selectedGenres[selectedGenres.length - 1];

      if (!initialGenres.some((tempGenre) => tempGenre.id === newGenre.id)) {
        // Add spaces around the "/"
        const formattedGenre = {
          ...newGenre,
          path: newGenre.path.replace(/\s*\/\s*/g, " / "),
        };

        // Capitalize each first letter
        formattedGenre.path = formattedGenre.path
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const updatedGenres = [...initialGenres, formattedGenre];
        onGenresChange(updatedGenres);
        setSearchedGenres((prevSearched) =>
          prevSearched.filter((tempGenre) => tempGenre.id !== newGenre.id)
        );
      }
    }
  };

  const newGenre = {
    id: initialGenres.length * -1,
    path: debouncedGenreInput,
  };

  const genreOptions = [
    ...initialGenres,
    ...(newGenre.path &&
    !searchedGenres.some((genre) => genre.path === newGenre.path)
      ? [newGenre]
      : []),
    ...searchedGenres,
  ];

  return (
    <Box sx={{ marginTop: "10px" }}>
      <Autocomplete
        multiple
        options={genreOptions}
        getOptionLabel={(genre) => genre.path}
        onChange={handleAddGenre}
        onInputChange={handleGenreInput}
        value={initialGenres}
        noOptionsText="Start typing to search"
        renderInput={(params) => (
          <TextField {...params} placeholder="Search genres" />
        )}
        renderTags={(value) => (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              maxHeight: "100px",
              overflowY: "auto",
            }}
          >
            {value.map((genre, index) => (
              <Chip
                key={genre.id}
                label={genre.path}
                onDelete={() => handleRemoveGenre(genre)}
              />
            ))}
          </Box>
        )}
      />
    </Box>
  );
}
