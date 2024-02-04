import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  useMediaQuery,
  createTheme,
  ThemeProvider,
  Menu,
  MenuItem,
} from "@mui/material";
import MediaQuickInfo from "./MediaQuickInfo";
import axios from "axios";
import { useLongPress } from "use-long-press";

// Drawer closed
const drawerClosedTheme = createTheme({
  breakpoints: {
    values: {
      xxs: 300,
      xs: 360,
      sm: 650,
      md: 950,
      lg: 1100,
      xl: 1920,
    },
  },
});

// Drawer open
const drawerOpenTheme = createTheme({
  breakpoints: {
    values: {
      xxs: 240,
      xs: 700,
      sm: 900,
      md: 1200,
      lg: 1280,
      xl: 1920,
    },
  },
});

function MediaInstanceCard(props) {
  const [mediaInfo, setMediaInfo] = useState({});
  const [userStatus, setUserStatus] = useState("");
  const [dateRead, setDateRead] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [fullInfoOpen, setFullInfoOpen] = useState(false);

  const theme = props.drawerOpen ? drawerOpenTheme : drawerClosedTheme;
  const isXxs = useMediaQuery(theme.breakpoints.down("xxs"));

  const gridPoints = {
    xxs: props.drawerOpen ? 12 : 12,
    xs: props.drawerOpen ? 3 : 4,
    sm: props.drawerOpen ? 3 : 3,
    md: props.drawerOpen ? 2 : 2,
    lg: props.drawerOpen ? 2 : 2,
    xl: props.drawerOpen ? 2 : 2,
  };

  // // UNCOMMENT THIS TO DEBUG SCREEN SIZE LOGIC
  // const belowXxs = useMediaQuery(theme.breakpoints.down("xxs"));
  // const xxsToxs = useMediaQuery(theme.breakpoints.between("xxs", "xs"));
  // const xsToSm = useMediaQuery(theme.breakpoints.between("xs", "sm"));
  // const smToMd = useMediaQuery(theme.breakpoints.between("sm", "md"));
  // const mdToLg = useMediaQuery(theme.breakpoints.between("md", "lg"));
  // const lgToXl = useMediaQuery(theme.breakpoints.between("lg", "xl"));
  // const aboveXl = useMediaQuery(theme.breakpoints.up("xl"));
  // if (belowXxs) {
  //   console.log("smaller than xxs");
  // } else if (xxsToxs) {
  //   console.log("xxs to xs");
  // } else if (xsToSm) {
  //   console.log("xs to sm");
  // } else if (smToMd) {
  //   console.log("sm to md");
  // } else if (mdToLg) {
  //   console.log("md to lg");
  // } else if (lgToXl) {
  //   console.log("lg to xl");
  // } else if (aboveXl) {
  //   console.log("larger than xl");
  // }

  const handleContextMenu = (event) => {
    if (!fullInfoOpen && mediaInfo.mediaTypeId == 1) {
      setContextMenuPosition({
        top: event.clientY,
        left: event.clientX,
      });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenuPosition(null);
  };

  const bind = useLongPress((e) => {
    handleContextMenu(e);
  });

  const deleteMediaInstance = () => {
    props.deleteMediaInstance(props.mediaInstance);
  };

  const updateUserStatus = (status) => {
    axios
      .post("/book/" + props.mediaInstance.Book.id + "/updateStatus", {
        bookId: props.mediaInstance.Book.id,
        userId: props.user.id,
        status: status
      })
      .then((response) => {
        setUserStatus(status);
      })
      .catch((error) => {
        console.log(error);
      });

    handleCloseContextMenu();
  };

  const updateDateRead = (dateRead) => {
    if (dateRead == "Invalid Date") {
      dateRead = null;
    }
    axios
      .post("/book/" + props.mediaInstance.Book.id + "/updateDateRead", {
        bookId: props.mediaInstance.Book.id,
        userId: props.user.id,
        dateRead: dateRead,
      })
      .then((response) => {
        setDateRead(dateRead);
      })
      .catch((error) => {
        console.log(error);
      });

    handleCloseContextMenu();
  };

  return (
    <ThemeProvider
      theme={props.drawerOpen ? drawerOpenTheme : drawerClosedTheme}
    >
      <Grid
        item
        xs={isXxs ? gridPoints["xxs"] : gridPoints["xs"]}
        sm={gridPoints["sm"]}
        md={gridPoints["md"]}
        lg={gridPoints["lg"]}
        xl={gridPoints["xl"]}
      >
        <div
          onContextMenu={(e) => {
            e.preventDefault();
          }}
          {...bind()}
        >
          <MediaQuickInfo
            productCode={props.mediaInstance.Book?.isbn13 || null}
            mediaTitle={
              props.mediaInstance.Book?.title ||
              props.mediaInstance.Movie?.title
            }
            mediaYear={props.mediaInstance.Movie?.releaseDate || null}
            mediaTypeId={props.mediaTypeId}
            mediaExists={true}
            mediaInfo={mediaInfo}
            setMediaInfo={setMediaInfo}
            mediaInstance={props.mediaInstance}
            coverUrl={coverUrl}
            setCoverUrl={setCoverUrl}
            clickable={true}
            deleteMediaInstance={deleteMediaInstance}
            updateMediaInstance={props.updateMediaInstance}
            user={props.user}
            userStatus={userStatus}
            setUserStatus={setUserStatus}
            updateUserStatus={updateUserStatus}
            dateRead={dateRead}
            setDateRead={setDateRead}
            updateDateRead={updateDateRead}
            fullInfoOpen={fullInfoOpen}
            setFullInfoOpen={setFullInfoOpen}
          />
        </div>
      </Grid>
      <Menu
        open={Boolean(contextMenuPosition)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenuPosition}
      >
        <MenuItem
          onClick={() => updateUserStatus("unread")}
          sx={{ color: "black" }}
        >
          Unread
        </MenuItem>
        <MenuItem
          onClick={() => updateUserStatus("reading")}
          sx={{ color: "#3d6ed1" }}
        >
          Reading
        </MenuItem>
        <MenuItem
          onClick={() => updateUserStatus("read")}
          sx={{ color: "#008800" }}
        >
          Read
        </MenuItem>
        <MenuItem
          onClick={() => updateUserStatus("abandoned")}
          sx={{ color: "#ff0e00" }}
        >
          Abandoned
        </MenuItem>
      </Menu>
    </ThemeProvider>
  );
}

export default MediaInstanceCard;
