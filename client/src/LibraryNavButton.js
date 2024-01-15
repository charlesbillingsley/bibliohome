import React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import * as iconsMaterial from "@mui/icons-material";

export default function LibraryNavButton(props) {
    const getIcon = () => {
        const IconComponent = iconsMaterial[props.library.icon];
        return <IconComponent />;
    }

    return (
        <ListItemButton
            id={props.library.id}
            selected={props.selectedLibrary.id === props.library.id}
            onClick={(event) => { props.setSelectedLibrary(props.library) }}
        >
            <ListItemIcon>
                {getIcon()}
            </ListItemIcon>
            <ListItemText primary={props.library.name} />
        </ListItemButton>
    )
}
