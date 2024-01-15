import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LibraryNavButton from './LibraryNavButton';
import NewLibrary from './NewLibrary';

const drawerWidth = 240;

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

export default function AppDrawer(props) {
    const [newLibraryModalOpen, setNewLibraryModalOpen] = useState(false)

    const openModal = () => {
        setNewLibraryModalOpen(true);
    }
    const closeModal = () => {
        setNewLibraryModalOpen(false);
    }

    return (
        <div>
            <StyledDrawer variant="permanent" open={props.drawerOpen}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: [1],
                    }}
                >
                    <IconButton onClick={props.toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider />
                <List component="nav">
                    {props.libraries.map(library => {
                        return(
                            <LibraryNavButton 
                                key={library.id}
                                library={library}
                                setSelectedLibrary={props.setSelectedLibrary}
                                selectedLibrary={props.selectedLibrary}
                            />
                        );
                    })}
                    <Divider />
                    <ListItemButton onClick={openModal}>
                        <ListItemIcon>
                            <AddIcon />
                        </ListItemIcon>
                        <ListItemText primary="New Library" />
                    </ListItemButton>
                </List>
            </StyledDrawer>
            <NewLibrary 
                open={newLibraryModalOpen}
                closeModal={closeModal}
                updateLibraries={props.updateLibraries}
            />
        </div>
    )
}
