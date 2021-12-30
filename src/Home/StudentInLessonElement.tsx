import { Avatar, Checkbox, Divider, IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { Draggable } from "react-beautiful-dnd";

import { StudentInLesson } from "../Courses/Group.entity";
import { StudentInLessonStatus } from "../Courses/StudentInLessonStatus";
import { Student } from "../Students/Student.entity";
import { useRender } from "../Utils/useEntityQuery";
import { useMemo, useState } from "react";
import { ValueListValueConverter } from "remult/valueConverters";
import { uiTools, useField } from "../Utils/FormDialog";
import { Action, DividerAction } from "../Utils/AugmentRemult";
import { FullMenu } from "../Utils/Menu";

export function StudentInLessonElement({ student, studentInLesson, index }: {
    studentInLesson: StudentInLesson,
    student: Student,
    index: number
}) {

    const render = useRender();
    useField(studentInLesson.$.status);


    const editNote = () => {
        uiTools.formDialog({
            title: student.fullName,
            fields: [studentInLesson.$.note],
            ok: async () => studentInLesson.save(),
            cancel: () =>
                studentInLesson._.undoChanges()

        })
    }


    const changeStatus = async (status: StudentInLessonStatus) => {
        if (status === studentInLesson.status)
            return;
        studentInLesson.status = status;
        render();

        if (status.askForComment) {
            editNote();
        }
        else
            studentInLesson.save();
    }

    const lineClicked = async () => {
        changeStatus(studentInLesson.status.onClickChangeTo());
    }
    const options = useMemo(() => {
        const statuses = (studentInLesson.$.status.metadata.valueConverter as unknown as ValueListValueConverter<StudentInLessonStatus>).getOptions();
        const menuOptions: Action[] = statuses.map((status) => ({
            caption: status.caption,
            icon: () => status.icon,
            click: () => changeStatus(status)
        }));
        menuOptions.push(DividerAction, {
            caption: "עדכן הערה",
            click: () => editNote()
        }, {
            caption: "פרטי תלמיד",
            click: () => student.editDialog(() => render())
        })

        return menuOptions;
    }, []);


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
                        <FullMenu options={options} />
                    }
                    disablePadding
                >
                    <ListItemButton role={undefined} onClick={(e) => lineClicked()} dense>
                        <ListItemIcon>
                            {studentInLesson.status.icon}
                        </ListItemIcon>
                        <ListItemText primary={student.fullName} secondary={student.type + ', ' + student.$.lessonLength.displayValue + (studentInLesson.note ? " - " + studentInLesson.note : "")} />
                    </ListItemButton>
                </ListItem>
                <Divider component="li" />
            </>)
            }
        </Draggable >)
}