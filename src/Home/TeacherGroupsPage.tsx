import { AppBar, Avatar, Box, Button, Checkbox, Dialog, Divider, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Slide, TextField, Toolbar, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { Fragment, useMemo, useState } from "react";
import { useRemult } from "../common";
import { Group, StudentInLesson } from "../Courses/Group.entity";
import { StudentInLessonStatus } from "../Courses/StudentInLessonStatus";
import { Student } from "../Students/Student.entity";
import { useEntityArray, useEntityQuery } from "../Utils/useEntityQuery";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { User } from "../Users/User.entity";
import { uiTools } from "../Utils/FormDialog";
import { DateOnlyValueConverter } from "remult/valueConverters";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
    ResponderProvided
} from "react-beautiful-dnd";
import { StudentInLessonElement } from "./StudentInLessonElement";
import { FieldRef } from "remult";
import { Action } from "../Utils/AugmentRemult";
import { FullMenu } from "../Utils/Menu";

export function TeacherGroupsPage({ teacherId }: { teacherId: string }) {
    const remult = useRemult();
    const currentUser = useEntityQuery(() => remult.repo(User).findId(teacherId, { useCache: false }), [teacherId]);
    const groups = useEntityArray(() =>
        !currentUser.data ? undefined :
            remult.repo(Group).find({
                where: {
                    teacher: currentUser.data
                }
            }), [currentUser.data]);
    const [date, setDate] = useState(new Date());

    const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(undefined);
    const students = useEntityArray(async () =>
        selectedGroup ? remult.repo(Student).find({ where: { group: selectedGroup } }) :
            [], [selectedGroup?.id]);
    const studentsInLesson = useEntityArray(async () => {
        if (!selectedGroup || !students.data)
            return [];
        let result = await remult.repo(StudentInLesson).find({ where: { date, studentId: students.data!.map(s => s.id) } });
        result.push(...students.data!.filter(s => !result.find(l => l.studentId === s.id)).map(s => remult.repo(StudentInLesson).create({ studentId: s.id, date: date })));
        return result;
    },

        [selectedGroup?.id, students.data, date]);
    const handleClose = () => {
        setSelectedGroup(undefined);
    };

    const menuOptions =  [
        {
            caption: "עדכן בוטל על ידינו לכולם",
            click: () => {
                var s = remult.repo(StudentInLesson).create();
                uiTools.formDialog({
                    title: "עדכן בוטל על ידינו לכולם בתאריך " + DateOnlyValueConverter.displayValue!(date),
                    fields: [s.$.note],
                    ok: async () => {
                        for (const st of studentsInLesson.data!) {
                            st.note = s.note;
                            st.status = StudentInLessonStatus.canceled;
                            await st.save();
                        }
                        studentsInLesson.setData([...studentsInLesson.data!])
                    }
                })
            }
        }
    ];



    const reorder = (list: any[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };
    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) {
            return;
        }

        const items = reorder(students.data!, result.source.index, result.destination.index);

        students.setData(items);
        for (let order = 0; order < items.length; order++) {
            const student = items[order] as Student;
            student.assign({ order }).save();
        }
    };



    return (<>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {groups.data?.map(group => (
                <Fragment key={group.id}>
                    <ListItemButton role={undefined} onClick={() => setSelectedGroup(group)}>
                        <ListItem >
                            <ListItemText primary={group.name} secondary={group.town} />
                        </ListItem>
                    </ListItemButton>
                    <Divider component="li" />
                </Fragment>
            ))}
        </List>

        <Button variant="contained" onClick={async () => {
            const g = remult.repo(Group).create({ teacher: currentUser.data });
            let fields: FieldRef<Group>[] = [g.$.name, g.$.town];
            if (currentUser.data!.priceBand > 0)
                fields.push(g.$.isBand);
            uiTools.formDialog({
                title: "הוסף קבוצה חדשה",
                fields,
                ok: async () => {
                    await g.save();
                    groups.add(g);
                }
            });
        }}>הוסף קבוצה חדשה</Button>

        <Dialog
            fullScreen
            open={!!selectedGroup}
            onClose={(handleClose)}
            TransitionComponent={Transition}
        >
            <Box sx={{ position: 'relative' }}>
                <Toolbar variant="dense">
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <ChevronRightIcon />
                    </IconButton>
                    <TextField type="date" inputProps={{ style: { textAlign: 'right' } }} sx={{ m: 2 }}

                        label="תאריך השיעור"
                        value={DateOnlyValueConverter.toInput!(date, 'date')}
                        onChange={e => setDate(DateOnlyValueConverter.fromInput!(e.target.value, 'date'))}

                    />
                    <FullMenu options={menuOptions} />

                </Toolbar>
            </Box>

            <Divider />
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <List
                            ref={provided.innerRef}
                            sx={{ width: '100%', bgcolor: 'background.paper' }}>
                            {students.data?.map((student, index) => {
                                let sl = studentsInLesson.data!.find(x => x.studentId === student.id);
                                if (!sl) {
                                    return <Fragment key={student.id} />;
                                }

                                return (
                                    <StudentInLessonElement
                                        key={student.id}
                                        index={index}
                                        student={student}
                                        studentInLesson={sl} />
                                );
                            })}

                            {provided.placeholder}
                        </List>)}
                </Droppable>
            </DragDropContext>
            <Button variant="contained" onClick={async () => {
                const student = remult.repo(Student).create({ group: selectedGroup!, order: students.data!.length });
                student.editDialog(() => students.add(student));
            }}>הוסף תלמיד</Button>
        </Dialog>
    </>)
}


const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="right" ref={ref} {...props} />;
});

