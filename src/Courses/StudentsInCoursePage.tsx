import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { RemultContext } from "../common";

import { Student } from "../Students/Student.entity";
import { uiTools } from "../Utils/FormDialog";
import { openDialog } from "../Utils/StackUtils";
import { useEntityArray, useEntityQuery } from "../Utils/useEntityQuery";
import { defaultEditFields } from "../Utils/useMuiGrid";
import { Course } from "./Course.entity";

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
                SelectStudent({
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
                    }
                })
            }}>Add</button>
            <ul>
                {students?.map(s => (<li key={s.id}>{s.name}</li>))}
            </ul>
        </>
    )
}


export interface SelectStudentsArgs {
    select: (student: Student) => void;
}
export function SelectStudent(props: SelectStudentsArgs) {
    const remult = useContext(RemultContext);
    return openDialog(close => {
        const SelectStudentElement = () => {
            const [search, setSearch] = useState('');
            const { data } = useEntityQuery(async () => remult.repo(Student).find({
                where: {
                    name: { $contains: search }
                }
            }), [search]);
            const select = (s: Student) => {
                props.select(s); close();
            }
            return (
                <>
                    <input value={search} onChange={e => setSearch(e.target.value)} />
                    <ul>{data?.map(s => (<li key={s.id} onClick={() => select(s)}>{s.name}</li>))}
                    </ul>
                    <button onClick={() => close()}>סגור</button>
                    <button onClick={() => {
                        let s = remult.repo(Student).create({ name: search });
                        uiTools.formDialog({
                            title: 'תלמיד חדש',
                            fields: defaultEditFields(s),
                            ok: async () => {
                                await s.save();
                                select(s);
                            }
                        })
                    }}>תלמיד חדש</button>
                </>)
        }
        return (<SelectStudentElement />);
    });
}

