import React, { useEffect, useState } from "react";
import axios from "axios";
import { Autocomplete, TextField, Box, Chip } from "@mui/material";

export default function ProductionCompanyInput({
  initialProductionCompanies,
  onProductionCompaniesChange,
}) {
  const [productionCompaniesInput, setProductionCompaniesInput] = useState("");
  const [searchedProductionCompanies, setSearchedProductionCompanies] =
    useState([]);
  const [
    debouncedProductionCompaniesInput,
    setDebouncedProductionCompaniesInput,
  ] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedProductionCompaniesInput(productionCompaniesInput);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [productionCompaniesInput]);

  useEffect(() => {
    const fetchProductionCompanies = async () => {
      try {
        const response = await axios.get(
          `/productionCompany/search?search=${debouncedProductionCompaniesInput}`
        );
        const fetchedProductionCompanies = response.data;
        const filteredProductionCompanies = fetchedProductionCompanies.filter(
          (productionCompany) =>
            !initialProductionCompanies.some(
              (tempProductionCompany) =>
                tempProductionCompany.id === productionCompany.id
            )
        );
        setSearchedProductionCompanies(filteredProductionCompanies);
      } catch (error) {
        console.error(error);
      }
    };

    if (debouncedProductionCompaniesInput) {
      fetchProductionCompanies();
    } else {
      setSearchedProductionCompanies([]);
    }
  }, [debouncedProductionCompaniesInput, initialProductionCompanies]);

  const handleProductionCompanyInput = (event, newInputValue) => {
    setProductionCompaniesInput(newInputValue);
  };

  const handleRemoveProductionCompany = (productioncompany) => {
    const updatedProductionCompanies = initialProductionCompanies.filter(
      (tempProductionCompany) =>
        tempProductionCompany.id !== productioncompany.id
    );
    onProductionCompaniesChange(updatedProductionCompanies);
  };

  const handleAddProductionCompany = (
    event,
    selectedProductionCompanies,
    reason
  ) => {
    if (reason === "clear") {
      onProductionCompaniesChange([]);
      setSearchedProductionCompanies([]);
    } else if (selectedProductionCompanies.length) {
      let productioncompany =
        selectedProductionCompanies[selectedProductionCompanies.length - 1];

      if (
        !initialProductionCompanies.some(
          (tempProductionCompany) =>
            tempProductionCompany.id === productioncompany.id
        )
      ) {
        const updatedProductionCompanies = [
          ...initialProductionCompanies,
          productioncompany,
        ];
        onProductionCompaniesChange(updatedProductionCompanies);
        setSearchedProductionCompanies((prevSearched) =>
          prevSearched.filter(
            (tempProductionCompany) =>
              tempProductionCompany.id !== productioncompany.id
          )
        );
      }
    }
  };

  const newProductionCompanyNames =
    debouncedProductionCompaniesInput.split(" ");
  const newProductionCompany = {
    id: initialProductionCompanies.length * -1 || -1,
    name: newProductionCompanyNames,
  };

  const productioncompanyOptions = [
    ...initialProductionCompanies,
    ...(newProductionCompany.name
      ? [newProductionCompany]
      : []),
    ...searchedProductionCompanies,
  ];

  return (
    <Box sx={{ marginTop: "10px" }}>
      <Autocomplete
        multiple
        options={productioncompanyOptions}
        getOptionLabel={(productioncompany) =>
          `${productioncompany.name}`
        }
        onChange={handleAddProductionCompany}
        onInputChange={handleProductionCompanyInput}
        value={initialProductionCompanies}
        noOptionsText="Start Typing to Search"
        renderInput={(params) => (
          <TextField {...params} placeholder="Search Production Companies" />
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
            {value.map((productioncompany, index) => (
              <Chip
                key={productioncompany.id}
                label={
                  productioncompany.name
                }
                onDelete={() =>
                  handleRemoveProductionCompany(productioncompany)
                }
              />
            ))}
          </Box>
        )}
      />
    </Box>
  );
}
