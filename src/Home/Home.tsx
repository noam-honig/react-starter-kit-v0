import { AppBar, Button, Checkbox, Dialog, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, Toolbar, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { useState } from "react";
import { useRemult } from "../common";
import { Lesson, StudentInLesson } from "../Courses/Course.entity";
import { Student } from "../Students/Student.entity";
import { useEntityArray } from "../Utils/useEntityQuery";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { AlternateEmailRounded, CheckRounded } from "@mui/icons-material";

export function Home() {
    const remult = useRemult();
    const lessons = useEntityArray(() => remult.repo(Lesson).find({
        where: Lesson.currentUser()
    }), [remult.user.id]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(undefined);
    const students = useEntityArray(async () =>
        selectedLesson ? remult.repo(Student).find({ where: Student.inCourse(selectedLesson.course.id) }) :
            [], [selectedLesson?.course.id]);
    const studentInLesson = useEntityArray(async () =>
        selectedLesson ? remult.repo(StudentInLesson).find({ where: { lessonId: selectedLesson.id } }) : [],
        [selectedLesson?.id]);
    const handleClose = () => {
        setSelectedLesson(undefined);
    };

    const attended = (student: Student) => {
        let z = studentInLesson.data?.find(x => x.studentId === student.id);
        if (z)
            return z.attended;
        return false;
    }
    const setAttended = async (student: Student) => {
        let sil = studentInLesson.data?.find(x => x.studentId === student.id);
        if (!sil) {
            sil = await remult.repo(StudentInLesson).create({ studentId: student.id, lessonId: selectedLesson?.id });
            studentInLesson!.data!.push(sil);
        }
        sil.attended = !sil.attended;
        await sil.save();
        studentInLesson.setData([...studentInLesson!.data!]);
    }


    return (<>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {lessons.data?.map(l => (<>
                <ListItemButton role={undefined} onClick={() => setSelectedLesson(l)}>
                    <ListItem key={l.id}>
                        <ListItemText primary={l.course.name} secondary={l.$.date.displayValue} />
                    </ListItem>
                </ListItemButton>
                <Divider component="li" />
            </>
            ))}
        </List>
        <Dialog
            fullScreen
            open={!!selectedLesson}
            onClose={(handleClose)}
            TransitionComponent={Transition}
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar variant="dense">
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <ChevronRightIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {selectedLesson?.$.date.displayValue}
                    </Typography>

                </Toolbar>
            </AppBar>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {students.data?.map((student) => {


                    return (
                        <>
                            <ListItem
                                key={student.id}

                                disablePadding
                            >
                                <ListItemButton role={undefined} onClick={(e) => setAttended(student)} dense>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={attended(student)}
                                            tabIndex={-1}
                                            disableRipple

                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={student.name} />
                                </ListItemButton>
                            </ListItem>
                            <Divider component="li" />
                        </>
                    );
                })}
            </List>
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

