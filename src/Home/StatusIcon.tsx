import { styled, useTheme } from "@mui/material";

import React from "react";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { StudentInLessonStatus } from "../Courses/StudentInLessonStatus";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';



export const StatusIcon: React.FC<{ status: StudentInLessonStatus }>
    = ({ status }) => {

        const theme = useTheme();
        let icon: any = undefined;
        status.icon({
            chars: c => icon = c.toUpperCase(),
            checkedBox: () => icon = (<CheckBoxIcon />),
            uncheckedBox: () => icon = (<CheckBoxOutlineBlankIcon />),
            CheckCircleOutline: () => icon = (<CheckCircleOutlineIcon />)
        })

        const CustomizedListItemIcon = styled('span')`
        color:${theme.palette.primary.main};
        font-size:${theme.typography.htmlFontSize * 1.3}px;
        `;
        return (
            <CustomizedListItemIcon>
                {icon}
            </CustomizedListItemIcon>)
    }