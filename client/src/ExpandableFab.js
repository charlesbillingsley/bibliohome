import React, { useState } from "react";
import { Box, Fab, Zoom } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";


export default function ExpandableFab(props) {
  const [expanded, setExpanded] = useState(false);
  
  const handleClick = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  return (
    <>
      <Zoom in={expanded}>
        <Box>
          <Fab
            color="customGreen"
            aria-label="add"
            size="medium"
            sx={{
              position: "fixed",
              bottom: (theme) => theme.spacing(19),
              right: (theme) => theme.spacing(6.7),
            }}
            onClick={props.openModal}
          >
            <AddIcon />
          </Fab>
          <Fab
            color="secondary"
            aria-label="settings"
            size="medium"
            sx={{
              position: "fixed",
              bottom: (theme) => theme.spacing(12),
              right: (theme) => theme.spacing(6.7),
            }}
            onClick={props.openEditLibrary}
          >
            <EditIcon />
          </Fab>
        </Box>
      </Zoom>
      
      <Fab 
        color="primary"
        onClick={handleClick}
        sx={{
          position: "fixed",
          bottom: (theme) => theme.spacing(4),
          right: (theme) => theme.spacing(6),
        }}
      >
        {
        expanded ? (
          <MenuOpenIcon />
        ) : <MenuIcon />
        }
      </Fab>
    </>
  );
}
