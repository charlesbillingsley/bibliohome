import React, { useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import MediaInstanceCard from "./MediaInstanceCard";
import NewMedia from "./NewMedia.js";
import { Box, Typography, Link, Divider } from "@mui/material";
import axios from "axios";

function CardGrid(props) {
  const [mediaInstances, setMediaInstances] = React.useState([]);
  const [newMediaInstance, setNewMediaInstance] = React.useState();
  const [mediaInstanceCards, setMediaInstanceCards] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [hasMorePages, setHasMorePages] = React.useState(true);
  const observerRef = useRef(null);

  const removeCommonWords = (title, commonWords) => {
    const words = title.toLowerCase().split(" ");
    const firstWord = words[0];
    if (commonWords.includes(firstWord)) {
      return words.slice(1).join(" ");
    }
    return title;
  };

  const deleteMediaInstance = (mediaInstance) => {
    const endpoint =
      mediaInstance.mediaTypeId === 1 ? "bookInstance/" : "movieInstance/";
    axios
      .post(endpoint + mediaInstance.id + "/delete")
      .then(function (response) {
        setMediaInstances((prevInstances) => {
          const index = prevInstances.findIndex(
            (obj) => obj.id === mediaInstance.id
          );

          if (index > -1) {
            const updatedInstances = [
              ...prevInstances.slice(0, index),
              ...prevInstances.slice(index + 1),
            ];
            return updatedInstances;
          }

          return prevInstances;
        });
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const updateMediaInstance = (mediaInstance) => {
    setMediaInstances((prevInstances) => {
      const index = prevInstances.findIndex(
        (obj) => obj.id === mediaInstance.id
      );

      if (index > -1) {
        const updatedInstances = [
          ...prevInstances.slice(0, index),
          mediaInstance,
          ...prevInstances.slice(index + 1),
        ];
        return updatedInstances;
      }

      return prevInstances;
    });
  };

  const scrollToSection = (letter) => {
    let currentLetter = letter;
    var sectionElement = document.getElementById(`section-${letter}`);

    // Find the nearest available section by looping until a section is found
    while (!sectionElement && currentLetter < "Z") {
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
      sectionElement = document.getElementById(`section-${currentLetter}`);
    }

    if (sectionElement) {
      sectionElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    if (props.selectedLibrary) {
      axios
        .get("mediaInstance/search", {
          params: {
            libraryId: props.selectedLibrary.id,
            pageSize: 1000,
            page: 1,
          },
        })
        .then(function (response) {
          setMediaInstances(response.data.rows);
        })
        .catch(function (error) {
          console.log(error.message);
          setMediaInstances([]);
          setMediaInstanceCards([]);
        });
    }
  }, [props.selectedLibrary]);

  useEffect(() => {
    if (mediaInstances && mediaInstances.length) {
      const commonWords = ["a", "an", "the"];

      let sortedInstances = mediaInstances.sort((a, b) => {
        const mediaTypea = a.mediaTypeId === 1 ? "Book" : "Movie";
        const mediaTypeb = b.mediaTypeId === 1 ? "Book" : "Movie";
        const titleA = removeCommonWords(a[mediaTypea].title, commonWords);
        const titleB = removeCommonWords(b[mediaTypeb].title, commonWords);

        return titleA.localeCompare(titleB);
      });

      let groupedCards = {};
      sortedInstances.forEach((mediaInstance) => {
        const mediaType = mediaInstance.mediaTypeId === 1 ? "Book" : "Movie";
        const title = removeCommonWords(
          mediaInstance[mediaType].title,
          commonWords
        );
        var firstLetter = title.charAt(0).toUpperCase();

        if (!isNaN(firstLetter)) {
          firstLetter = "#";
        }

        if (!groupedCards[firstLetter]) {
          groupedCards[firstLetter] = [];
        }

        groupedCards[firstLetter].push(
          <MediaInstanceCard
            key={mediaInstance.id}
            mediaInstance={mediaInstance}
            user={props.user}
            mediaTypeId={mediaInstance.mediaTypeId}
            drawerOpen={props.drawerOpen}
            deleteMediaInstance={deleteMediaInstance}
            updateMediaInstance={updateMediaInstance}
          />
        );
      });

      let cards = [];
      for (const letter in groupedCards) {
        cards.push(
          <div key={letter} id={`section-${letter}`}>
            <Typography
              variant="h6"
              margin="0"
              paddingTop="1em"
              textAlign="left"
              color="#1976d2"
            >
              {letter}
            </Typography>
            <Divider width="85%" style={{ marginBottom: "1em" }}></Divider>
            <Grid container spacing={1} width="100%">
              {groupedCards[letter]}
            </Grid>
          </div>
        );
      }

      setMediaInstanceCards(cards);
    }
  }, [mediaInstances, props.drawerOpen]);

  useEffect(() => {
    if (newMediaInstance) {
      setMediaInstances((prevInstances) => {
        const updatedInstances = [...prevInstances, newMediaInstance];

        return updatedInstances;
      });
    }
  }, [newMediaInstance]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMorePages) {
        setPage((prevPage) => prevPage + 1);
      }
    }, options);

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMorePages]);

  useEffect(() => {
    if (page > 1) {
      axios
        .get("mediaInstance/search", {
          params: {
            libraryId: props.selectedLibrary.id,
            pageSize: 10,
            page: page,
          },
        })
        .then(function (response) {
          const newInstances = response.data.rows;
          if (newInstances && newInstances.length) {
            setMediaInstances((prevInstances) => [
              ...prevInstances,
              ...newInstances,
            ]);
          } else {
            setHasMorePages(false);
          }
        })
        .catch(function (error) {
          console.log(error.message);
        });
    }
  }, [page, props.selectedLibrary]);

  var alphabet = [...Array(26)].map((_, i) => String.fromCharCode(65 + i));
  alphabet.unshift("#");

  return (
    <Box textAlign="center">
      <Typography
        variant="h6"
        align="center"
        sx={{ padding: "10px" }}
        display={mediaInstances && mediaInstances.length ? "none" : ""}
      >
        No Media Found.
      </Typography>

      <Box display="flex" position="relative">
        <Box flex="1">{mediaInstanceCards.map((section) => section)}</Box>

        <Box
          width="50px"
          mr={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          position="fixed"
          top="70px"
          right="0"
          zIndex="1"
          maxHeight="calc(100vh - 150px)"
          overflow="auto"
          sx={{
            "&::-webkit-scrollbar": {
              width: "2px",
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
          {alphabet.map((letter) => (
            <Link
              key={letter}
              onClick={() => scrollToSection(letter)}
              color="inherit"
              style={{ cursor: "pointer", textDecoration: 'none'}}
            >
              {letter}
            </Link>
          ))}
        </Box>
      </Box>

      <NewMedia
        selectedLibrary={props.selectedLibrary}
        setNewInstance={setNewMediaInstance}
        open={props.newMediaModalOpen}
        closeModal={props.closeNewMediaModal}
      />
    </Box>
  );
}

export default CardGrid;
