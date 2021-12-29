import { Avatar, Checkbox, Divider, IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Action, DividerAction } from "./AugmentRemult";
import React from "react";

export function FullMenu({ options }: { options: Action<never>[] }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <>
            <IconButton edge="end" onClick={handleClick}>
                <MoreVertIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {options.map((option, i) => {

                    return (Boolean(option !== DividerAction) ? <MenuItem key={option.caption || i} onClick={() => {
                        handleClose();
                        option.click(undefined!);
                    }}>
                        {option.icon && <ListItemIcon>
                            {React.createElement(option.icon!)}
                        </ListItemIcon>}
                        <ListItemText>{option.caption}</ListItemText>
                    </MenuItem> : <Divider key={option.caption || i} component="li" />)
                })}


            </Menu>
        </>)
}