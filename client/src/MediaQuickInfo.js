import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import axios from "axios";
import {
  Card,
  CardMedia,
  CardContent,
  Box,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import MediaFullInfo from "./MediaFullInfo";
import { useTheme } from "@emotion/react";

export default function MediaQuickInfo(props) {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const cardWidth = isSm ? 80 : 128;
  const cardHeight = isSm ? 122 : 196;
  const lineHeight = isSm ? 1.4 : 1.4;
  const lineHeight2 = isSm ? 1.2 : 1.2;
  const fontSize = isSm ? ".55rem" : ".75rem";

  const openFullInfo = () => {
    props.setFullInfoOpen(true);
  };

  const closeFullInfo = () => {
    props.setFullInfoOpen(false);
  };

  const handleClick = () => {
    if (!props.fullInfoOpen && props.clickable) {
      openFullInfo();
    }
  };

  const getAuthorData = () => {
    var authorText = "";

    if (
      props.mediaInfo &&
      props.mediaInfo.authors &&
      props.mediaInfo.authors.length > 0
    ) {
      var author = props.mediaInfo.authors[0];
      if (typeof author === "string") {
        authorText = author;
      } else {
        authorText = author.firstName + " " + author.lastName;
      }
    }

    return authorText;
  };

  // Function to fetch media from your media API
  const fetchMediaFromInternalAPI = () => {
    if (props.mediaTypeId == 1) {
      _fetchBookFromInternalAPI();
    } else if (props.mediaTypeId == 2) {
      _fetchMovieFromInternalAPI();
    }
  };

  // Function to fetch a book from Initernal API
  const _fetchBookFromInternalAPI = () => {
    axios
      .get("/book/search", {
        params: {
          isbn13: props.productCode,
        },
      })
      .then(function (response) {
        var foundMediaInfo = response.data.book;
        if (foundMediaInfo) {
          props.setMediaInfo(foundMediaInfo);

          var imagePath = "/image/book/" + foundMediaInfo.photo;
          props.setCoverUrl(axios.defaults.baseURL + imagePath);
          props.setUserStatus(getUserStatus(foundMediaInfo));
          props.setDateRead(getDateRead(foundMediaInfo));
        } else {
          props.setMediaInfo(null);
          props.setCoverUrl("/noImage.jpg");
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  // Function to fetch a book from Initernal API
  const _fetchMovieFromInternalAPI = () => {
    axios
      .get("/movie/search", {
        params: {
          title: props.mediaTitle,
          releaseDate: props.mediaYear,
        },
      })
      .then(function (response) {
        var foundMediaInfo = response.data.movie;
        if (foundMediaInfo) {
          props.setMediaInfo(foundMediaInfo);

          var imagePath = "/image/movie/" + foundMediaInfo.photo;
          props.setCoverUrl(axios.defaults.baseURL + imagePath);
        } else {
          props.setMediaInfo(null);
          props.setCoverUrl("/noImage.jpg");
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  // Function to fetch media from External API
  const fetchMediaFromExternalAPI = () => {
    if (props.mediaTypeId == 1) {
      _fetchBookFromExternalAPI();
    } else if (props.mediaTypeId == 2) {
      _fetchMovieFromExternalAPI();
    }
  };

  // Function to fetch a book from External API
  const _fetchBookFromExternalAPI = () => {
    // Get api keys
    axios
      .get("/appSettings/1")
      .then(function (response) {
        if (response.data) {
          let bookApiKey = response.data.bookApiKey;
          if (!bookApiKey) {
            props.setMediaNotFound(true);
          } else {
            var googleApiUrl = (
              "https://www.googleapis.com/books/v1/volumes?key=" + bookApiKey
              + "&q="
            );
            var urlFilled = false;

            if (props.productCode) {
              googleApiUrl += "isbn:" + props.productCode;
              urlFilled = true;
            } else if (
              props.mediaTitle &&
              props.mediaAuthorFirstName &&
              props.mediaAuthorLastName
            ) {
              googleApiUrl +=
                "title:" +
                props.mediaTitle +
                "&author:" +
                props.mediaAuthorFirstName +
                "%20" +
                props.mediaAuthorLastName;
              urlFilled = true;
            }

            if (urlFilled) {
              console.log("Fetching book from Google API");
              axios
                .get(googleApiUrl)
                .then(function (response) {
                  if (response.data.totalItems === 0) {
                    props.setMediaNotFound(true);
                  } else {
                    // Get matching book
                    let match = response.data.items[0];

                    if (props.productCode) {
                      for (var i of response.data.items) {
                        for (var j of i.volumeInfo.industryIdentifiers) {
                          if (j.identifier == props.productCode) {
                            match = i;
                          }
                        }
                      }
                    }

                    axios
                      .get(match.selfLink+"?key=" + bookApiKey) // Call a GET command on the selfLink URL
                      .then(function (selfLinkResponse) {
                        var foundMediaInfo = selfLinkResponse.data.volumeInfo;
                        props.setMediaInfo(foundMediaInfo);
                        props.setMediaNotFound(false);

                        var foundCoverUrl = "";
                        if (foundMediaInfo && foundMediaInfo.imageLinks) {
                          foundCoverUrl = foundMediaInfo.imageLinks.smallThumbnail;
                          foundCoverUrl = foundCoverUrl.replace("&edge=curl", "");
                        }

                        props.setCoverUrl(foundCoverUrl);
                        props.setUserStatus("unread");
                      })
                      .catch(function (selfLinkError) {
                        console.log(selfLinkError.message);
                      });
                  }
                })
                .catch(function (error) {
                  console.log(error.message);
                });
            }
          }
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  };
  

  // Function to fetch a movie from External API
  const _fetchMovieFromExternalAPI = () => {
    // Get api keys
    axios
      .get("/appSettings/1")
      .then(function (response) {
        if (response.data) {
          let movieApiKey = response.data.movieApiKey;
          if (!movieApiKey || !props.mediaTitle || !props.mediaYear) {
            props.setMediaNotFound(true);
          }
          // Get the movie info
          var movieSearchApiUrl =
            "https://api.themoviedb.org/3/search/movie?query=" +
            props.mediaTitle +
            "&year=" +
            props.mediaYear +
            "&api_key=" +
            movieApiKey;

          console.log("Fetching movie from TMDB API");
          axios
            .get(movieSearchApiUrl)
            .then(function (response) {
              if (response.data.total_results <= 0) {
                props.setMediaNotFound(true);
              } else {
                let foundMovieId = response.data.results[0].id;
                var movieApiUrl =
                  "https://api.themoviedb.org/3/movie/" +
                  foundMovieId +
                  "?api_key=" +
                  movieApiKey;

                axios.get(movieApiUrl).then(function (movieResponse) {
                  let foundMediaInfo = movieResponse.data;
                  props.setMediaInfo({
                    title: foundMediaInfo.title,
                    releaseDate: foundMediaInfo.release_date,
                    description: foundMediaInfo.overview,
                    subtitle: foundMediaInfo.tagline,
                    runtime: foundMediaInfo.runtime,
                    budget: foundMediaInfo.budget,
                    revenue: foundMediaInfo.revenue,
                    genres: foundMediaInfo.genres,
                    productionCompanies: foundMediaInfo.production_companies,
                  });
                  props.setMediaNotFound(false);

                  var foundCoverUrl = "";
                  if (foundMediaInfo && foundMediaInfo.poster_path) {
                    foundCoverUrl =
                      "https://image.tmdb.org/t/p/w200" +
                      foundMediaInfo.poster_path;
                  }

                  props.setCoverUrl(foundCoverUrl);
                });
              }
            })
            .catch(function (error) {
              console.log(error.message);
            });
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const getStyle = () => {
    let style = {
      display: "flex",
      flexDirection: "column",
      width: cardWidth,
      position: "relative",
    };

    if (props.clickable) {
      style["&:hover"] = {
        cursor: "pointer",
      };
    }

    return style;
  };

  const getUserStatus = (mediaInfo) => {
    let userStatus = "unread";

    if (mediaInfo && mediaInfo.users) {
      const users = mediaInfo.users;

      for (const user of users) {
        if (user.id === props.user.id) {
          userStatus = user.userStatus.status;
          break;
        }
      }
    }

    return userStatus;
  };

  const getDateRead = (mediaInfo) => {
    let dateRead = null;

    if (mediaInfo && mediaInfo.users) {
      const users = mediaInfo.users;

      for (const user of users) {
        if (user.id === props.user.id) {
          dateRead = user.userStatus.dateRead;
          console.log(dateRead);
          break;
        }
      }
    }

    return dateRead;
  };

  useEffect(() => {
    if (props.mediaExists) {
      if (!Object.keys(props.mediaInfo).length) {
        fetchMediaFromInternalAPI();
      }
    } else {
      fetchMediaFromExternalAPI();
    }
  }, [props.productCode]);

  const statusColors = {
    unread: "black",
    reading: "#3d6ed1",
    read: "#008800",
    abandoned: "#ff0e00",
  };

  return (
    <Card sx={getStyle()} onClick={handleClick}>
      {props.userStatus && (
        <Tooltip title={props.userStatus}>
          <div
            style={{
              width: 15,
              height: 15,
              borderRadius: "50%",
              backgroundColor: statusColors[props.userStatus],
              border: "2px solid white",
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1000,
            }}
          />
        </Tooltip>
      )}
      <CardMedia
        component="img"
        sx={{
          width: cardWidth,
          height: cardHeight,
        }}
        image={props.coverUrl || "/noImage.jpg"}
        alt={props.mediaInfo ? props.mediaInfo.title : ""}
        title={props.mediaInfo ? props.mediaInfo.title : ""}
        onError={(e) => {
          e.target.src = "/noImage.jpg";
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: "1",
        }}
      >
        <CardContent
          sx={{
            height: "5em",
            padding: "9px",
            "&:last-child": {
              paddingBottom: "9px",
            },
          }}
        >
          <Typography
            gutterBottom
            variant="caption"
            component="div"
            textAlign="center"
            fontSize={fontSize}
            fontWeight="bold"
            lineHeight={lineHeight}
            sx={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
            }}
          >
            {props.mediaInfo ? props.mediaInfo.title : ""}
          </Typography>
          <Typography
            gutterBottom
            variant="caption"
            component="div"
            textAlign="center"
            fontSize={fontSize}
            lineHeight={lineHeight2}
          >
            {props.mediaTypeId == 1 && getAuthorData()}
            {props.mediaTypeId == 2 &&
              props.mediaInfo?.releaseDate &&
              props.mediaInfo.releaseDate.split("-")[0]}
          </Typography>
        </CardContent>
        {props.mediaInfo ? (
          <div
            onContextMenu={(e) => {
              e.stopPropagation();
            }}
          >
            <MediaFullInfo
              open={props.fullInfoOpen ? props.fullInfoOpen : false}
              closeModal={closeFullInfo}
              mediaInfo={props.mediaInfo}
              mediaInstance={props.mediaInstance}
              mediaTypeId={props.mediaTypeId}
              setMediaInfo={props.setMediaInfo}
              userStatus={props.userStatus}
              updateUserStatus={props.updateUserStatus}
              dateRead={props.dateRead}
              updateDateRead={props.updateDateRead}
              coverUrl={props.coverUrl}
              setCoverUrl={props.setCoverUrl}
              deleteMediaInstance={props.deleteMediaInstance}
              updateMediaInstance={props.updateMediaInstance}
            />
          </div>
        ) : null}
      </Box>
    </Card>
  );
}
