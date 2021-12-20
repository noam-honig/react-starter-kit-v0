import { AppBar, Box, Button, Checkbox, Dialog, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, TextField, Toolbar, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { Fragment, useState } from "react";
import { useRemult } from "../common";
import { Group, StudentInLesson } from "../Courses/Course.entity";
import { Student } from "../Students/Student.entity";
import { useEntityArray, useEntityQuery } from "../Utils/useEntityQuery";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { User } from "../Users/User.entity";
import { uiTools } from "../Utils/FormDialog";
import { DateOnlyValueConverter, DateValueConverter } from "remult/valueConverters";

export function Home() {
    const remult = useRemult();
    const currentUser = useEntityQuery(() => remult.repo(User).findId(remult.user.id), [remult.user.id]);
    const groups = useEntityArray(() =>
        !currentUser ? undefined :
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
    const studentInLesson = useEntityArray(async () =>
        selectedGroup ? remult.repo(StudentInLesson).find({ where: { lessonId: selectedGroup.id } }) : [],
        [selectedGroup?.id]);
    const handleClose = () => {
        setSelectedGroup(undefined);
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
            sil = await remult.repo(StudentInLesson).create({ studentId: student.id, lessonId: selectedGroup?.id });
            studentInLesson!.data!.push(sil);
        }
        sil.attended = !sil.attended;
        await sil.save();
        studentInLesson.setData([...studentInLesson!.data!]);
    }



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
            uiTools.formDialog({
                title: "הוסף קבוצה חדשה",
                fields: [g.$.name, g.$.town],
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
                        color="secondary"
                        label="תאריך השיעור"
                        value={DateOnlyValueConverter.toInput!(date, 'date')}
                        onChange={e => setDate(DateOnlyValueConverter.fromInput!(e.target.value, 'date'))}

                    />

                </Toolbar>
            </Box>

            <Divider />
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
                                    <ListItemText primary={student.fullName} secondary={student.$.lessonType.displayValue} />
                                </ListItemButton>
                            </ListItem>
                            <Divider component="li" />
                        </>
                    );
                })}
            </List>
            <Button variant="contained" onClick={async () => {
                const student = remult.repo(Student).create({ group: selectedGroup! });
                uiTools.formDialog({
                    title: "הוסף תלמיד ",
                    fields: [student.$.firstName, student.$.lastName, student.$.parentName, student.$.parentPhone, student.$.lessonType],
                    ok: async () => {
                        await student.save();
                        students.add(student);
                    }
                });
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

