import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import axios from "axios";
import { Step, StepLabel, Stepper } from "@mui/material";
import MediaType from "./MediaType";
import EntryMethod from "./EntryMethod";
import MediaQuickInfo from "./MediaQuickInfo";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "10px",
  p: 4,
};

const steps = ["Type", "Entry Method", "Entry"];

export default function NewMedia(props) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [mediaType, setMediaType] = useState(null);
  const [mediaTypeError, setMediaTypeError] = useState("");
  const [mediaSaveError, setMediaSaveError] = useState("");
  const [productCode, setProductCode] = useState("");
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaYear, setMediaYear] = useState();
  const [mediaAuthorFirstName, setMediaAuthorFirstName] = useState("");
  const [mediaAuthorLastName, setMediaAuthorLastName] = useState("");
  const [mediaInfo, setMediaInfo] = useState(null);
  const [mediaExists, setMediaExists] = useState(false);
  const [mediaNotFound, setMediaNotFound] = useState(false);
  const [coverUrl, setCoverUrl] = useState("/noImage.jpg");

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      submit();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      if (prevActiveStep == 2) {
        // Clear out media info if going back to entry page
        setProductCode("");
        setMediaExists(false);
        setMediaInfo(null);
        setCoverUrl("/noImage.jpg");
      }
      return prevActiveStep - 1;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    setMediaType(null);
    setMediaTypeError("");
    setMediaExists(false);
    setProductCode("");
  };

  const clearAndClose = () => {
    handleReset();
    props.closeModal();
  };

  async function _saveBook() {
    var isbn10 = mediaInfo.industryIdentifiers.find(
      (x) => x.type === "ISBN_10"
    );
    var isbn13 = mediaInfo.industryIdentifiers.find(
      (x) => x.type === "ISBN_13"
    );

    try {
      // Check if the book already exists with the same ISBN
      const [existingBookISBN10, existingBookISBN13] = await Promise.all([
        axios.get("/book/search", {
          params: {
            isbn10: isbn10.identifier,
          },
        }),
        axios.get("/book/search", {
          params: {
            isbn13: isbn13.identifier,
          },
        }),
      ]);

      let existingBook;
      if (
        existingBookISBN10.data &&
        Object.keys(existingBookISBN10.data).length
      ) {
        existingBook = existingBookISBN10.data.book.id;
      } else if (
        existingBookISBN13.data &&
        Object.keys(existingBookISBN13.data).length
      ) {
        existingBook = existingBookISBN13.data.book.id;
      }

      // Create a new book
      if (!existingBook) {
        // Save the image to the file system
        let photoPath = null;

        if (mediaInfo.imageLinks && mediaInfo.imageLinks.smallThumbnail) {
          const smallThumbnail = mediaInfo.imageLinks.smallThumbnail;
          try {
            // Send the URL to the server for downloading and saving the image
            const saveImageResponse = await axios.post("/image/url", {
              imageUrl: smallThumbnail,
              type: "book",
            });

            // Retrieve the saved image path from the server response
            photoPath = saveImageResponse.data.imageName;
          } catch (error) {
            console.log("Failed to save the image:", error);
          }
        }

        // Save the book to the database
        const saveBookResponse = await axios.post("/book", {
          title: mediaInfo.title,
          isbn10: isbn10.identifier,
          isbn13: isbn13.identifier,
          subtitle: mediaInfo.subtitle,
          description: mediaInfo.description,
          pageCount: mediaInfo.pageCount,
          publisher: mediaInfo.publisher,
          publishedDate: mediaInfo.publishedDate,
          genres: mediaInfo.categories ? mediaInfo.categories : [],
          authors: mediaInfo.authors ? mediaInfo.authors : [],
          photo: photoPath,
        });

        existingBook = saveBookResponse.data.id;
        console.log("Book saved successfully:", saveBookResponse.data);
      }

      // Create a new book instance
      const saveBookInstanceResponse = await axios.post("/bookInstance", {
        bookId: existingBook,
        status: "Maintenance",
        libraryIds: [props.selectedLibrary.id],
      });
      props.setNewInstance(saveBookInstanceResponse.data);
    } catch (error) {
      console.log("Failed to save book instance:", error);
      setMediaSaveError(error.message);
    }
  }

  async function _saveMovie() {
    try {
      // Check if the movie already exists with the same Title and year
      const movieResponse = await axios.get("/movie/search", {
        params: {
          title: mediaInfo.title,
          releaseDate: mediaInfo.releaseDate,
        },
      });

      let existingMovie = movieResponse.data.movie
        ? movieResponse.data.movie.id
        : {};

      // Create a new movie
      if (!existingMovie || Object.keys(existingMovie).length === 0) {
        // Save the image to the file system
        let photoPath = null;

        if (coverUrl) {
          try {
            // Send the URL to the server for downloading and saving the image
            const saveImageResponse = await axios.post("/image/url", {
              imageUrl: coverUrl,
              type: "movie",
            });

            // Retrieve the saved image path from the server response
            photoPath = saveImageResponse.data.imageName;
          } catch (error) {
            console.log("Failed to save the image:", error);
          }
        }

        for (var productionCompany of mediaInfo.productionCompanies) {
          if (productionCompany.logo_path) {
            try {
              let pcUrl =
                "https://image.tmdb.org/t/p/w200" + productionCompany.logo_path;

              // Send the URL to the server for downloading and saving the image
              const saveImageResponse = await axios.post("/image/url", {
                imageUrl: pcUrl,
                type: "productionCompany",
              });

              // Retrieve the saved image path from the server response
              const pcPhotoPath = saveImageResponse.data.imageName;

              productionCompany.photoPath = pcPhotoPath;
            } catch (error) {
              console.log("Failed to save a production company image:", error);
            }
          }
        }

        // Save the movie to the database
        const saveMovieResponse = await axios.post("/movie", {
          title: mediaInfo.title,
          releaseDate: mediaInfo.releaseDate,
          description: mediaInfo.description,
          genres: mediaInfo.genres ? mediaInfo.genres : [],
          productionCompanies: mediaInfo.productionCompanies
            ? mediaInfo.productionCompanies
            : [],
          subtitle: mediaInfo.subtitle,
          runtime: mediaInfo.runtime,
          budget: mediaInfo.budget,
          revenue: mediaInfo.revenue,
          photo: photoPath,
        });

        existingMovie = saveMovieResponse.data.id;
        console.log("Movie saved successfully:", saveMovieResponse.data);
      }

      // Create a new movie instance
      const saveMovieInstanceResponse = await axios.post("/movieInstance", {
        movieId: existingMovie,
        status: "Maintenance",
        libraryIds: [props.selectedLibrary.id],
      });
      props.setNewInstance(saveMovieInstanceResponse.data);
    } catch (error) {
      console.log("Failed to save movie instance:", error);
      setMediaSaveError(error.message);
    }
  }

  async function saveMedia() {
    setMediaSaveError("");
    if (mediaInfo) {
      if (mediaType.id == 1) {
        _saveBook();
      } else if (mediaType.id == 2) {
        _saveMovie();
      }
    }
  }

  const submit = async (req, res) => {
    // Validate
    var errored = false;
    setMediaTypeError("");

    if (!mediaType || !mediaType.name) {
      setMediaTypeError("This field is required.");
      errored = true;
    }

    // Create the media if it doesn't exist
    await saveMedia();

    // Success
    if (!mediaTypeError && !mediaSaveError) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const nextNotAllowed = () => {
    if (activeStep === 0) {
      return !(mediaType && mediaType.name);
    } else if (activeStep === 1) {
      if (mediaType.id == 1) {
        return (
          !productCode &&
          !(mediaTitle && mediaAuthorFirstName && mediaAuthorLastName)
        );
      } else {
        return !mediaTitle && !mediaYear;
      }
    } else if (activeStep === steps.length - 1) {
      return mediaNotFound || !mediaInfo;
    } else {
      return false;
    }
  };

  useEffect(() => {
    const checkBook = async () => {
      try {
        var isbn10 = mediaInfo.industryIdentifiers.find(
          (x) => x.type === "ISBN_10"
        );
        var isbn13 = mediaInfo.industryIdentifiers.find(
          (x) => x.type === "ISBN_13"
        );
        const [existingBookISBN10, existingBookISBN13] = await Promise.all([
          axios.get("/book/search", {
            params: {
              isbn10: isbn10.identifier,
            },
          }),
          axios.get("/book/search", {
            params: {
              isbn13: isbn13.identifier,
            },
          }),
        ]);

        if (
          existingBookISBN10.data &&
          existingBookISBN10.data.libraries &&
          existingBookISBN10.data.libraries.includes(props.selectedLibrary.id)
        ) {
          setMediaExists(true);
        } else if (
          existingBookISBN13.data &&
          existingBookISBN13.data.libraries &&
          existingBookISBN13.data.libraries.includes(props.selectedLibrary.id)
        ) {
          setMediaExists(true);
        } else {
          setMediaExists(false);
        }
      } catch (error) {
        console.log("Error occurred while fetching data:", error);
      }
    };

    const checkMovie = async () => {
      try {
        const existingMovie = await axios.get("/movie/search", {
          params: {
            title: mediaInfo.title,
            releaseDate: mediaInfo.releaseDate,
          },
        });

        if (
          existingMovie.data &&
          existingMovie.data.libraries &&
          existingMovie.data.libraries.includes(props.selectedLibrary.id)
        ) {
          setMediaExists(true);
        } else {
          setMediaExists(false);
        }
      } catch (error) {
        console.log("Error occurred while fetching data:", error);
      }
    };

    if (mediaInfo) {
      if (mediaType.id == 1) {
        checkBook();
      } else if (mediaType.id == 2) {
        checkMovie();
      }
    }
  }, [mediaInfo]);

  return (
    <Modal
      open={props.open}
      onClose={clearAndClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography align="center" variant="h5">
          Add Media
        </Typography>
        <Stepper activeStep={activeStep} sx={{ padding: "20px" }}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === 0 ? (
          <MediaType
            setMediaType={setMediaType}
            mediaTypeError={mediaTypeError}
          />
        ) : null}
        {activeStep === 1 ? (
          <EntryMethod
            productCode={productCode}
            setProductCode={setProductCode}
            setMediaTitle={setMediaTitle}
            setMediaYear={setMediaYear}
            setMediaAuthorFirstName={setMediaAuthorFirstName}
            setMediaAuthorLastName={setMediaAuthorLastName}
            mediaType={mediaType}
            next={handleNext}
          />
        ) : null}
        {activeStep === 2 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MediaQuickInfo
              productCode={productCode}
              mediaTitle={mediaTitle}
              mediaYear={mediaYear}
              mediaAuthorFirstName={mediaAuthorFirstName}
              mediaAuthorLastName={mediaAuthorLastName}
              mediaTypeId={mediaType.id}
              mediaExists={mediaExists}
              setMediaNotFound={setMediaNotFound}
              mediaInfo={mediaInfo}
              setMediaInfo={setMediaInfo}
              coverUrl={coverUrl}
              setCoverUrl={setCoverUrl}
              clickable={false}
            />
            {mediaExists ? (
              <div
                style={{ color: "red", marginTop: "5px", textAlign: "center" }}
              >
                Media already exists in library. <br />
                "Finish" will add another copy.
              </div>
            ) : null}
            {mediaNotFound ? (
              <div
                style={{ color: "red", marginTop: "5px", textAlign: "center" }}
              >
                Media not found.
                <br />
                Please add Manually.
              </div>
            ) : null}
          </div>
        ) : null}
        {activeStep === steps.length ? (
          <React.Fragment>
            <Typography align="center" sx={{ mt: 2, mb: 1 }}>
              Success!
            </Typography>
            <Typography align="center" sx={{ mt: 2, mb: 1 }}>
              Create another entry?
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleReset}>New Entry</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                pt: 2,
              }}
            >
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleNext} disabled={nextNotAllowed()}>
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </Box>
          </React.Fragment>
        )}
      </Box>
    </Modal>
  );
}
