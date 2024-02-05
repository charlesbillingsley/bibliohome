import React, { useEffect, useState } from "react";
import axios from "axios";
import { Autocomplete, TextField, Box, Chip } from "@mui/material";

export default function SeriesInput({ initialSeries, onSeriesChange }) {
  const [seriesInput, setSeriesInput] = useState("");
  const [searchedSeries, setSearchedSeries] = useState([]);
  const [debouncedSeriesInput, setDebouncedSeriesInput] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSeriesInput(seriesInput);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [seriesInput]);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.get(
          `/series/search?search=${debouncedSeriesInput}`
        );
        const fetchedSeries = response.data;
        const filteredSeries = fetchedSeries.filter(
          (series) =>
            !initialSeries.some((tempSeries) => tempSeries.id === series.id)
        );
        setSearchedSeries(filteredSeries);
      } catch (error) {
        console.error(error);
      }
    };

    if (debouncedSeriesInput) {
      fetchSeries();
    } else {
      setSearchedSeries([]);
    }
  }, [debouncedSeriesInput, initialSeries]);

  const handleSeriesInput = (event, newInputValue) => {
    setSeriesInput(newInputValue);
  };

  const handleRemoveSeries = (series) => {
    const updatedSeries = initialSeries.filter(
      (tempSeries) => tempSeries.id !== series.id
    );
    onSeriesChange(updatedSeries);
  };

  const handleAddSeries = (event, selectedSeries, reason) => {
    if (reason === "clear") {
      onSeriesChange([]);
      setSearchedSeries([]);
    } else if (selectedSeries.length) {
      let series = selectedSeries[selectedSeries.length - 1];

      if (!initialSeries.some((tempSeries) => tempSeries.id === series.id)) {
        const updatedSeries = [...initialSeries, series];
        onSeriesChange(updatedSeries);
        setSearchedSeries((prevSearched) =>
          prevSearched.filter((tempSeries) => tempSeries.id !== series.id)
        );
      }
    }
  };

  const newSeries = {
    id: initialSeries.length * -1 || -1,
    name: debouncedSeriesInput
  };

  const seriesOptions = [
    ...initialSeries,
    ...(newSeries.name ? [newSeries] : []),
    ...searchedSeries,
  ];

  return (
    <Box sx={{ marginTop: "10px" }}>
      <Autocomplete
        multiple
        options={seriesOptions}
        getOptionLabel={(series) =>
          `${series.name}`.trim()
        }
        onChange={handleAddSeries}
        onInputChange={handleSeriesInput}
        value={initialSeries}
        noOptionsText="Start Typing to Search"
        renderInput={(params) => (
          <TextField {...params} placeholder="Search series" />
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
            {value.map((series, index) => (
              <Chip
                key={series.id}
                label={series.name}
                onDelete={() => handleRemoveSeries(series)}
              />
            ))}
          </Box>
        )}
      />
    </Box>
  );
}
