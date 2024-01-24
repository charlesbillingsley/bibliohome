import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, ButtonBase, Card, CardContent, Grid } from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TextField from "@mui/material/TextField";
import TagIcon from "@mui/icons-material/Tag";
import BarcodeScanner from "./BarcodeScanner";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function EntryMethod(props) {
  const [barcodeEntry, setBarcodeEntry] = React.useState(false);
  const [productCodeEntry, setProductCodeEntry] = React.useState(false);
  const [manualEntry, setManualEntry] = React.useState(false);

  const toggleBarcodeEntry = () => {
    setBarcodeEntry(!barcodeEntry);
    setProductCodeEntry(false);
    setManualEntry(false);
  };
  const toggleProductCodeEntry = () => {
    setBarcodeEntry(false);
    setProductCodeEntry(!productCodeEntry);
    setManualEntry(false);
  };
  const toggleManualEntry = () => {
    setBarcodeEntry(false);
    setProductCodeEntry(false);
    setManualEntry(!manualEntry);
  };
  const handleScannedProductCode = (result) => {
    props.setProductCode(result);
    setBarcodeEntry(false);
    setManualEntry(false);
    props.next();
  };
  const handleProductCodeEntry = (result) => {
    props.setProductCode(result);
  };

  return (
    <Box>
      {props.mediaType.id == 1 && (
        <Grid
          container
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item>
            <Card
              sx={{
                ":hover": {
                  boxShadow: 4,
                },
              }}
            >
              <ButtonBase onClick={toggleBarcodeEntry}>
                <CardContent sx={{ width: "100px" }}>
                  <QrCodeScannerIcon fontSize="large" />
                  <Typography>Barcode</Typography>
                </CardContent>
              </ButtonBase>
            </Card>
          </Grid>
          <Grid item>
            <Card
              sx={{
                ":hover": {
                  boxShadow: 4,
                },
              }}
            >
              <ButtonBase onClick={toggleProductCodeEntry}>
                <CardContent sx={{ width: "100px" }}>
                  <TagIcon fontSize="large" />
                  <Typography variant="body2">ISBN</Typography>
                </CardContent>
              </ButtonBase>
            </Card>
          </Grid>
          <Grid item>
            <Card
              sx={{
                ":hover": {
                  boxShadow: 4,
                },
              }}
            >
              <ButtonBase onClick={toggleManualEntry}>
                <CardContent sx={{ width: "100px" }}>
                  <EditNoteIcon fontSize="large" />
                  <Typography>Manual</Typography>
                </CardContent>
              </ButtonBase>
            </Card>
          </Grid>
        </Grid>
      )}
      <Box
        sx={{
          textAlign: "center",
          marginTop: 2,
        }}
      >
        {barcodeEntry && (
          <BarcodeScanner 
            productCode={props.productCode}
            setResult={handleScannedProductCode}
          />
        )}
        {productCodeEntry && (
          <TextField
            placeholder="ISBN"
            onChange={(e) => handleProductCodeEntry(e.target.value)}
          />
        )}
        {(manualEntry || props.mediaType.id == 2) && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "150px",
                paddingLeft: "15px",
                paddingRight: "15px",
                border: "1px solid #888",
                borderRadius: "4px",
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  width: "3px",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#555",
                },
              }}
            >
              <TextField
                label="Title"
                name="Title"
                variant="standard"
                sx={{ marginTop: "5px" }}
                onChange={(e) => props.setMediaTitle(e.target.value)}
              ></TextField>
              {props.mediaType.id == 1 ? (
                <Box sx={{ display: "flex" }}>
                  <TextField
                    label="Author First Name"
                    name="Author FN"
                    autoComplete="No"
                    variant="standard"
                    sx={{ marginTop: "5px" }}
                    onChange={(e) =>
                      props.setMediaAuthorFirstName(e.target.value)
                    }
                  ></TextField>
                  <TextField
                    label="Author Last Name"
                    name="Author LN"
                    autoComplete="No"
                    variant="standard"
                    sx={{ marginTop: "5px", marginLeft: "10px" }}
                    onChange={(e) =>
                      props.setMediaAuthorLastName(e.target.value)
                    }
                  ></TextField>
                </Box>
              ) : (
                <Box sx={{ display: "flex" }}>
                  <DatePicker
                    label="Release Year"
                    sx={{ marginTop: "10px" }}
                    views={["year"]}
                    onChange={(e) => {
                      props.setMediaYear(e);
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
