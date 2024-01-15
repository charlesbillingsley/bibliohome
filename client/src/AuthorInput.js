import React, { useEffect, useState } from "react";
import axios from "axios";
import { Autocomplete, TextField, Box, Chip } from "@mui/material";

export default function AuthorInput({ initialAuthors, onAuthorsChange }) {
  const [authorInput, setAuthorInput] = useState("");
  const [searchedAuthors, setSearchedAuthors] = useState([]);
  const [debouncedAuthorInput, setDebouncedAuthorInput] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedAuthorInput(authorInput);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [authorInput]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get(
          `/author/search?search=${debouncedAuthorInput}`
        );
        const fetchedAuthors = response.data;
        const filteredAuthors = fetchedAuthors.filter(
          (author) =>
            !initialAuthors.some((tempAuthor) => tempAuthor.id === author.id)
        );
        setSearchedAuthors(filteredAuthors);
      } catch (error) {
        console.error(error);
      }
    };

    if (debouncedAuthorInput) {
      fetchAuthors();
    } else {
      setSearchedAuthors([]);
    }
  }, [debouncedAuthorInput, initialAuthors]);

  const handleAuthorInput = (event, newInputValue) => {
    setAuthorInput(newInputValue);
  };

  const handleRemoveAuthor = (author) => {
    const updatedAuthors = initialAuthors.filter(
      (tempAuthor) => tempAuthor.id !== author.id
    );
    onAuthorsChange(updatedAuthors);
  };

  const handleAddAuthor = (event, selectedAuthors, reason) => {
    if (reason === "clear") {
      onAuthorsChange([]);
      setSearchedAuthors([]);
    } else if (selectedAuthors.length) {
      let author = selectedAuthors[selectedAuthors.length - 1];

      if (!initialAuthors.some((tempAuthor) => tempAuthor.id === author.id)) {
        const updatedAuthors = [...initialAuthors, author];
        onAuthorsChange(updatedAuthors);
        setSearchedAuthors((prevSearched) =>
          prevSearched.filter((tempAuthor) => tempAuthor.id !== author.id)
        );
      }
    }
  };

  const newAuthorNames = debouncedAuthorInput.split(" ");
  const newAuthor = {
    id: initialAuthors.length * -1 || -1,
    firstName: newAuthorNames.slice(0, -1).join(" "),
    lastName: newAuthorNames.slice(-1)[0] || "",
  };

  const authorOptions = [
    ...initialAuthors,
    ...(newAuthor.firstName && newAuthor.lastName ? [newAuthor] : []),
    ...searchedAuthors,
  ];

  return (
    <Box sx={{ marginTop: "10px" }}>
      <Autocomplete
        multiple
        options={authorOptions}
        getOptionLabel={(author) =>
          `${author.firstName} ${author.lastName}`.trim()
        }
        onChange={handleAddAuthor}
        onInputChange={handleAuthorInput}
        value={initialAuthors}
        noOptionsText="Start Typing to Search"
        renderInput={(params) => (
          <TextField {...params} placeholder="Search authors" />
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
            {value.map((author, index) => (
              <Chip
                key={author.id}
                label={author.firstName + " " + author.lastName}
                onDelete={() => handleRemoveAuthor(author)}
              />
            ))}
          </Box>
        )}
      />
    </Box>
  );
}
