
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { RemultContext } from "../common";
import { Student } from "../Students/Student.entity";
import { uiTools } from "../Utils/FormDialog";
import { useEntityArray, useEntityQuery } from "../Utils/useEntityQuery";
import { defaultEditFields } from "../Utils/useMuiGrid";
import { Course } from "./Course.entity";
import { SelectDialog } from "../Utils/SelectDialog";
import { Button, Grid, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";


export function CourseDetailsPage() {
    const remult = useContext(RemultContext);
    let { id } = useParams<"id">();
    const { data: course } = useEntityQuery(() => remult.repo(Course).findId(id!), [id]);
    const { data: students, ...studentTools } = useEntityArray(async () => remult.repo(Student).find({ where: Student.inCourse(id!) }), [id]);
    const { data: lessons, ...lessonsUtils } = useEntityArray(() => course?.lessons.load(), [course]);
    if (!course)
        return (<h1>loading</h1>);
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper>
                        <Typography variant="h4">{course.name}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <Paper>
                        <Typography variant="h6">תלמידים</Typography>


                        <Button variant="outlined" onClick={() => {
                            addStudent(course, studentTools.add);
                        }}>הוסף תלמיד</Button>
                        <List>
                            {students?.map(s => (<ListItem key={s.id}>
                                <ListItemText>{s.name}</ListItemText>
                            </ListItem>))}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper>
                        <Typography variant="h6">שעורים</Typography>


                        <Button variant="outlined" onClick={() => {
                            let l = course.lessons.create({ course, date: new Date() });
                            uiTools.formDialog({
                                title: "הוסף שעור",
                                fields: [l.$.date],
                                ok: async () => {
                                    await l.save();
                                    lessonsUtils.add(l);
                                }
                            })
                        }}>הוסף שעור</Button>
                        <List>
                            {lessons?.map(s => (<ListItem key={s.id}>
                                <ListItemText>{s.$.date.displayValue} </ListItemText>
                            </ListItem>))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}


function addStudent(course: Course, add: (s: Student) => void) {
    SelectDialog(Student,
        {
            select: async (s) => {
                //improve later
                let sc = await course.students.reload();
                if (!sc.find(sc => sc.studentId === s.id && sc.courseId == course.id)) {
                    await course.students.create({
                        studentId: s.id,
                        courseId: course.id
                    }).save();
                    add(s);
                }
            },
            actions: [
                {
                    caption: 'תלמיד חדש',
                    click: async (x) => {
                        let s = x.repo.create({ name: x.searchValue });
                        uiTools.formDialog({
                            title: 'תלמיד חדש',
                            fields: defaultEditFields(s),
                            ok: async () => {
                                await s.save();
                                x.select(s);
                            }
                        });
                    }
                }
            ]
        }
    );
}

