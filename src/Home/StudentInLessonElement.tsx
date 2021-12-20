import { Avatar, Checkbox, Divider, IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { Draggable } from "react-beautiful-dnd";

import { StudentInLesson } from "../Courses/Course.entity";
import { StudentInLessonStatus } from "../Courses/StudentInLessonStatus";
import { Student } from "../Students/Student.entity";
import { useRender } from "../Utils/useEntityQuery";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMemo, useState } from "react";
import { ValueListValueConverter } from "remult/valueConverters";

export function StudentInLessonElement({ student, studentInLesson, index }: {
    studentInLesson: StudentInLesson,
    student: Student,
    index: number
}) {

    const render = useRender();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeStatus = async (status: StudentInLessonStatus) => {
        studentInLesson.status = status;

        studentInLesson.save();
        handleClose();
        render();
    }

    const lineClicked = async () => {
        changeStatus(studentInLesson.status.onClickChangeTo());
    }
    const options = useMemo(() => (studentInLesson.$.status.metadata.valueConverter as unknown as ValueListValueConverter<StudentInLessonStatus>).getOptions(), []);


    return (
        <Draggable

            draggableId={student.id}
            index={index}
        >{(provided, snapshot) => (
            <>
                <ListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    secondaryAction={
                        <>
                            <IconButton edge="end" onClick={handleClick}>
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                            >
                                {options.map(option =>
                                (<MenuItem onClick={() => changeStatus(option)}>
                                    {option.icon}
                                    <ListItemText>{option.caption}</ListItemText>
                                </MenuItem>))}

                            </Menu>
                        </>
                    }
                    disablePadding
                >
                    <ListItemButton role={undefined} onClick={(e) => lineClicked()} dense>
                        {studentInLesson.status.icon}
                        <ListItemText primary={student.fullName} secondary={student.$.lessonType.displayValue} />
                    </ListItemButton>
                </ListItem>
                <Divider component="li" />
            </>)
            }
        </Draggable >)
}