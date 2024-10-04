import React from 'react';
import { Drawer, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Sidebar = ({ children, isOpen, onToggle }) => {
    return (
        <>
            <Drawer
                variant="persistent"
                anchor="left"
                open={isOpen}
                sx={{
                    width: 250,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 250,
                        boxSizing: 'border-box',
                        top: 70,
                        height: 'calc(100% - 70px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(241, 241, 241, 0.1)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(136, 136, 136, 0.5)',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: 'rgba(136, 136, 136, 0.8)',
                        },
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(136, 136, 136, 0.5) rgba(241, 241, 241, 0.1)',
                    },
                }}
            >
                <div className="sidebar-content">
                    <h3>Filtros</h3>
                    {children}
                </div>
            </Drawer>
            <IconButton
                onClick={onToggle}
                sx={{
                    position: 'fixed',
                    left: isOpen ? 250 : 0,
                    top: 80,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    zIndex: 1300,
                    transition: 'left 0.3s',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                }}
            >
                {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
        </>
    );
};

export default Sidebar;