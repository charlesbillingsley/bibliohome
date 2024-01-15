import React, { useState, useEffect } from "react";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  ListItemIcon,
  InputAdornment,
} from "@mui/material";
import debounce from "lodash/debounce";
import * as iconsMaterial from "@mui/icons-material";

export default function IconInput(props) {
  const [defaultIcon, setDefaultIcon] = useState("MenuBookRounded");
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [preloadedOptions, setPreloadedOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = debounce((searchTerm) => {
    setLoading(true);
    const iconNames = preloadedOptions.filter((iconName) =>
      iconName.toLowerCase().includes(searchTerm)
    );
    setOptions(iconNames);
    setLoading(false);
  }, 300);

  useEffect(() => {
    setDefaultIcon(props.selectedIcon);
    const allIconNames = Object.keys(iconsMaterial);
    setPreloadedOptions(allIconNames);
  }, []);

  return (
    <Autocomplete
      sx={props.sx}
      id="icon-input"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      isOptionEqualToValue={(option, value) => option === value}
      getOptionLabel={(option) => option}
      noOptionsText="Type to Search"
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose an icon"
          variant="outlined"
          placeholder={defaultIcon}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {props.selectedIcon && (
                  <InputAdornment position="start">
                    {React.createElement(iconsMaterial[props.selectedIcon])}
                  </InputAdornment>
                )}
              </>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          value={props.selectedIcon || defaultIcon}
          onChange={(event) => props.setSelectedIcon(defaultIcon)}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <ListItemIcon>
            {React.createElement(iconsMaterial[option])}
          </ListItemIcon>
          {option}
        </li>
      )}
      onInputChange={(event, newInputValue) => {
        if (newInputValue === "") {
          setOptions([]);
        } else {
          debouncedSearch(newInputValue);
        }
      }}
      onChange={(event, value) => props.setSelectedIcon(value)}
    />
  );
}
