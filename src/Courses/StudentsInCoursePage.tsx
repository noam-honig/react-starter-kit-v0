import { Button, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { RemultContext } from "../common";

import { Student } from "../Students/Student.entity";
import { uiTools } from "../Utils/FormDialog";
import { openDialog } from "../Utils/StackUtils";
import { useEntityArray, useEntityQuery } from "../Utils/useEntityQuery";
import { defaultEditFields } from "../Utils/useMuiGrid";
import { Course } from "./Course.entity";
import CloseIcon from '@mui/icons-material/Close';
import { SelectDialog } from "../Utils/SelectDialog";


export function StudentsInCoursePage() {
    const remult = useContext(RemultContext);
    let { id } = useParams<"id">();
    const { data: course } = useEntityQuery(() => remult.repo(Course).findId(id!), [id]);
    const { data: students, ...studentTools } = useEntityArray(async () => remult.repo(Student).find({ where: Student.inCourse(id!) }), [id]);
    if (!course)
        return (<h1>loading</h1>);
    return (
        <>
            <span>{course.name}</span>
            <button onClick={() => {
                SelectDialog(Student,
                    {
                        select: async s => {
                            //improve later
                            let sc = await course.students.reload();
                            if (!sc.find(sc => sc.studentId === s.id)) {
                                await course.students.create({
                                    studentId: s.id,
                                    courseId: course.id
                                }).save();
                                studentTools.add(s);
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
                                    })
                                }
                            }
                        ]
                    }
                )
            }}>Add</button>
            <ul>
                {students?.map(s => (<li key={s.id}>{s.name}</li>))}
            </ul>
        </>
    )
}


