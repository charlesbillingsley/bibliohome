import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import parse from "html-react-parser";
import CloseIcon from "@mui/icons-material/Close";
import {
  Card,
  CardMedia,
  Grid,
  ThemeProvider,
  useMediaQuery,
  useTheme,
  createTheme,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  List,
  ListItemText,
  IconButton,
} from "@mui/material";
import UploadImage from "./UploadImage";
import EditBook from "./EditBook";
import EditMovie from "./EditMovie";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const style = {
  display: "flex",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "1000px",
  maxHeight: "90%",
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
};

const confirmationStyle = {
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  maxWidth: "1000px",
  maxHeight: "50%",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "10px",
  p: 4,
};

const editMediaStyle = {
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "700px",
  maxHeight: "90%",
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
};

const customTheme = createTheme({
  breakpoints: {
    values: {
      xxs: 240,
      xs: 600,
      sm: 750,
      md: 1000,
      lg: 1280,
      xl: 1920,
    },
  },
});

const statusColors = {
  unread: "black",
  reading: "#3d6ed1",
  read: "#008800",
  abandoned: "#ff0e00",
};

function formatMoney(number) {
  // Convert the number to a string and remove decimals
  const integerPart = Number(number).toFixed(0);

  // Add commas to the integer part
  const integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Add the currency symbol and combine the formatted parts
  const formattedMoney = `$${integerWithCommas}`;

  return formattedMoney;
}

export default function MediaFullInfo(props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editMediaOpen, setEditMediaOpen] = useState(false);
  const genrePropertyName =
    props.mediaTypeId === 1 ? "bookGenres" : "movieGenres";

  const handleStatusChange = (event) => {
    props.updateUserStatus(event.target.value);
  };

  const handleDateReadChange = (event) => {
    props.updateDateRead(dayjs(event).format("YYYY-MM-DD"));
  };

  const openRemoveConfirmation = () => {
    setConfirmationOpen(true);
  };

  const closeRemoveConfirmation = () => {
    setConfirmationOpen(false);
  };

  const handleConfirmRemove = () => {
    props.deleteMediaInstance();
    closeRemoveConfirmation();
    props.closeModal();
  };

  const handleCancelRemove = () => {
    closeRemoveConfirmation(false);
  };

  const openImageUpload = () => {
    setUploadOpen(true);
  };

  const closeImageUpload = () => {
    setUploadOpen(false);
  };

  const openEditMedia = () => {
    setEditMediaOpen(true);
  };

  const closeEditMedia = () => {
    setEditMediaOpen(false);
  };

  const getAuthors = () => {
    var authors = "";

    if (props.mediaInfo.authors) {
      if (typeof props.mediaInfo.authors[0] === "string") {
        authors = props.mediaInfo.authors.join(", ");
      } else {
        var authorStrings = [];
        for (var author of props.mediaInfo.authors) {
          authorStrings.push(author.firstName + " " + author.lastName);
        }
        authors = authorStrings.join(", ");
      }
    }

    return authors;
  };

  const getProductionCompanies = () => {
    var productionCompanies = "";

    if (props.mediaInfo.productionCompanies) {
      if (typeof props.mediaInfo.productionCompanies[0] === "string") {
        productionCompanies = props.mediaInfo.productionCompanies.join(", ");
      } else {
        var productionCompanyStrings = [];
        for (var productionCompany of props.mediaInfo.productionCompanies) {
          productionCompanyStrings.push(productionCompany.name);
        }
        productionCompanies = productionCompanyStrings.join(", ");
      }
    }

    return productionCompanies;
  };

  return (
    <Modal
      open={props.open}
      onClose={props.closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton
          onClick={props.closeModal}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            m: 1,
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
        <ThemeProvider theme={customTheme}>
          <Grid container spacing={2}>
            <Grid item sx={isXs ? { margin: "auto" } : { margin: 0 }}>
              <Card
                sx={{
                  width: 128,
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: 128,
                  }}
                  image={props.coverUrl || "/noImage.jpg"}
                  alt={props.mediaInfo.title}
                  title={props.mediaInfo.title}
                  onError={(e) => {
                    e.target.src = "/noImage.jpg";
                  }}
                />
              </Card>
              <Box sx={{ textAlign: "center", paddingTop: "5px" }}>
                <Button variant="text" size="small" onClick={openImageUpload}>
                  Upload
                </Button>
              </Box>
            </Grid>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="h5" fontWeight={"bold"}>
                  {props.mediaInfo.title}
                </Typography>
                <Typography variant="h6">{props.mediaInfo.subtitle}</Typography>
                <Typography variant="h7">{getAuthors()}</Typography>
              </Grid>
              {props.userStatus && (
                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                      labelId="status-select-label"
                      id="status-select"
                      value={props.userStatus}
                      label="Status"
                      onChange={handleStatusChange}
                      sx={{ color: statusColors[props.userStatus] }}
                    >
                      <MenuItem
                        sx={{ color: statusColors["unread"] }}
                        value={"unread"}
                      >
                        Unread
                      </MenuItem>
                      <MenuItem
                        sx={{ color: statusColors["reading"] }}
                        value={"reading"}
                      >
                        Reading
                      </MenuItem>
                      <MenuItem
                        sx={{ color: statusColors["read"] }}
                        value={"read"}
                      >
                        Read
                      </MenuItem>
                      <MenuItem
                        sx={{ color: statusColors["abandoned"] }}
                        value={"abandoned"}
                      >
                        Abandoned
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {props.userStatus && (
                <Grid item>
                  <FormControl fullWidth>
                    <DatePicker
                      label="Date Read"
                      sx={{ marginTop: "10px" }}
                      value={dayjs(props.dateRead).utc()}
                      onChange={handleDateReadChange}
                    />
                  </FormControl>
                </Grid>
              )}
              <Grid item>
                <Box>
                  <Box
                    sx={{
                      border: "1px solid lightgrey",
                      borderRadius: "10px",
                      padding: "8px",
                      maxHeight: 150,
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
                    }}
                  >
                    <Typography variant="body">
                      {props.mediaInfo.description
                        ? parse(props.mediaInfo.description)
                        : ""}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item>
                <Box
                  sx={{
                    border: "1px solid lightgrey",
                    borderRadius: "10px",
                    padding: "8px",
                  }}
                >
                  <Box>
                    <Typography variant="body" fontWeight={"bold"}>
                      {props.mediaInfo.publishedDate
                        ? props.mediaInfo.publishedDate.split("-")[0]
                        : ""}
                      {props.mediaInfo.releaseDate
                        ? props.mediaInfo.releaseDate.split("-")[0]
                        : ""}
                    </Typography>
                    {props.mediaInfo.pageCount && (
                      <Typography variant="body" sx={{ marginLeft: "10px" }}>
                        {props.mediaInfo.pageCount + " pages"}
                      </Typography>
                    )}
                    {props.mediaInfo.runtime && (
                      <Typography variant="body" sx={{ marginLeft: "10px" }}>
                        {props.mediaInfo.runtime + " minutes"}
                      </Typography>
                    )}
                    {props.mediaInfo.publisher && (
                      <Typography variant="body" sx={{ marginLeft: "10px" }}>
                        {props.mediaInfo.publisher
                          ? "(" + props.mediaInfo.publisher + ")"
                          : ""}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    {props.mediaInfo.budget ? (
                      <Typography variant="body">
                        Budget: {formatMoney(props.mediaInfo.budget)}
                      </Typography>
                    ) : null}
                    {props.mediaInfo.revenue && (
                      <Typography variant="body" sx={{ marginLeft: "10px" }}>
                        Revenue: {formatMoney(props.mediaInfo.revenue)}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    {props.mediaInstance?.numberOfCopies ? (
                      <Typography variant="body">
                        Copies: {props.mediaInstance.numberOfCopies}
                      </Typography>
                    ) : null}
                    {props.mediaInfo.binding && (
                      <Typography variant="body" sx={{ marginLeft: "10px" }}>
                        Binding:{" "}
                        {props.mediaInfo.binding.charAt(0).toUpperCase() +
                          props.mediaInfo.binding.slice(1)}
                      </Typography>
                    )}
                  </Box>
                  {(props.mediaInfo.isbn10 || props.mediaInfo.isbn13) && (
                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                      <Box sx={{ marginRight: "10px" }}>
                        <Typography
                          variant="body"
                          fontWeight="bold"
                          sx={{ marginRight: "5px" }}
                        >
                          ISBN 10:
                        </Typography>
                        <Typography variant="body">
                          {props.mediaInfo.isbn10}
                        </Typography>
                      </Box>
                      <Box sx={{ marginRight: "10px" }}>
                        <Typography
                          variant="body"
                          fontWeight="bold"
                          sx={{ marginRight: "5px" }}
                        >
                          ISBN 13:
                        </Typography>
                        <Typography variant="body">
                          {props.mediaInfo.isbn13}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
              {props.mediaInfo["productionCompanies"] &&
              props.mediaInfo.productionCompanies.length ? (
                <Grid item>
                  <Box
                    sx={{
                      border: "1px solid lightgrey",
                      borderRadius: "10px",
                      paddingLeft: "8px",
                      maxHeight: 100,
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
                    }}
                  >
                    <Typography variant="h7">
                      {getProductionCompanies()}
                    </Typography>
                  </Box>
                </Grid>
              ) : null}
              {props.mediaInfo[genrePropertyName] &&
              props.mediaInfo[genrePropertyName].length ? (
                <Grid item>
                  <Box
                    sx={{
                      border: "1px solid lightgrey",
                      borderRadius: "10px",
                      paddingLeft: "8px",
                      maxHeight: 100,
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
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={"bold"}>
                      Genres:
                    </Typography>
                    <List>
                      {props.mediaInfo[genrePropertyName].map((genre) => {
                        return (
                          <ListItemText key={genre.id}>
                            <Typography>{genre.path}</Typography>
                          </ListItemText>
                        );
                      })}
                    </List>
                  </Box>
                </Grid>
              ) : null}
              {props.mediaInfo.series && props.mediaInfo.series.length ? (
                <Grid item>
                  <Box
                    sx={{
                      border: "1px solid lightgrey",
                      borderRadius: "10px",
                      paddingLeft: "8px",
                      maxHeight: 100,
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
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={"bold"}>
                      Series:
                    </Typography>
                    <List>
                      {props.mediaInfo.series.map((series) => {
                        return (
                          <ListItemText key={series.id}>
                            <Typography>
                              {series.name} (Book: {series.BookSeries.orderNumber})
                            </Typography>
                          </ListItemText>
                        );
                      })}
                    </List>
                  </Box>
                </Grid>
              ) : null}
              <Grid item>
                <Box
                  sx={{ display: "flex", justifyContent: "center", gap: "5px" }}
                >
                  <Button variant="outlined" onClick={openEditMedia}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={openRemoveConfirmation}
                  >
                    Remove
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </ThemeProvider>
        <Modal
          open={confirmationOpen}
          onClose={closeRemoveConfirmation}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={confirmationStyle}>
            <Typography variant="h6" gutterBottom align="center">
              Are you sure you want to remove this media from the current
              library?
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
                gap: "10px",
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancelRemove}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmRemove}
                sx={{ marginRight: "8px" }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={editMediaOpen}
          onClose={closeEditMedia}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={editMediaStyle}>
            <IconButton
              onClick={closeEditMedia}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                m: 1,
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h5">Edit Media</Typography>
            {props.mediaTypeId === 1 ? (
              <EditBook
                mediaInfo={props.mediaInfo}
                setMediaInfo={props.setMediaInfo}
                mediaInstance={props.mediaInstance}
                updateMediaInstance={props.updateMediaInstance}
                mediaTypeId={props.mediaTypeId}
                closeModal={closeEditMedia}
              ></EditBook>
            ) : (
              <EditMovie
                mediaInfo={props.mediaInfo}
                setMediaInfo={props.setMediaInfo}
                mediaTypeId={props.mediaTypeId}
                closeModal={closeEditMedia}
              ></EditMovie>
            )}
          </Box>
        </Modal>
        <UploadImage
          type={props.mediaTypeId == 1 ? "book" : "movie"}
          open={uploadOpen}
          onClose={closeImageUpload}
          item={props.mediaInfo}
          setUrl={props.setCoverUrl}
        />
      </Box>
    </Modal>
  );
}
