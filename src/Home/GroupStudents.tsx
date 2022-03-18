import { Box, Button, Dialog, Divider, IconButton, List, TextField, Toolbar } from "@mui/material";
import React, { Fragment, useState } from "react";
import { useRemult } from "../common";
import { Group, StudentInLesson } from "../Courses/Group.entity";
import { StudentInLessonStatus } from "../Courses/StudentInLessonStatus";
import { Student } from "../Students/Student.entity";
import { useEntityArray } from "../Utils/useEntityQuery";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { uiTools } from "../Utils/FormDialog";
import { DateOnlyValueConverter } from "remult/valueConverters";
import {
    DragDropContext,
    Droppable, DropResult,
    ResponderProvided
} from "react-beautiful-dnd";
import { StudentInLessonElement } from "./StudentInLessonElement";
import { FullMenu } from "../Utils/Menu";
import { Transition } from "./TeacherGroupsPage";
import { Loading } from "./Loading";

export function GroupStudents({ selectedGroup, handleClose }: { selectedGroup?: Group; handleClose: () => void; }) {
    const remult = useRemult();
    const [date, setDate] = useState(new Date());
    const [showFrozen, setShowFrozen] = useState(false);
    const students = useEntityArray(async () => selectedGroup ? remult.repo(Student).find({
        where: {
            group: selectedGroup,
            frozen: showFrozen ? undefined : false
        }
    }) :
        [], [selectedGroup?.id, showFrozen]);
    const studentsInLesson = useEntityArray(async () => {
        if (!selectedGroup || !students.data)
            return [];
        let result = await remult.repo(StudentInLesson).find({ where: { date, studentId: students.data!.map(s => s.id) } });
        result.push(...students.data!.filter(s => !result.find(l => l.studentId === s.id)).map(s => remult.repo(StudentInLesson).create({ studentId: s.id, date: date })));
        return result;
    }, [selectedGroup?.id, students.data, date]);


    const menuOptions = [
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
                        studentsInLesson.setData([...studentsInLesson.data!]);
                    }
                });
            }
        }
    ];
    if (!showFrozen)
        menuOptions.push({
            caption: 'הצג תלמידי קפואים',
            click: () => setShowFrozen(true)
        })
    else
        menuOptions.push({
            caption: 'הסתר תלמידי קפואים',
            click: () => setShowFrozen(false)
        })



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
    return (
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
                        onChange={e => setDate(DateOnlyValueConverter.fromInput!(e.target.value, 'date'))} />
                    <FullMenu options={menuOptions} />

                </Toolbar>
            </Box>

            <Divider />
            {Loading([students, studentsInLesson], (<>
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
            </>))}
        </Dialog>);
}
