import { Button, FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import { FunctionComponent, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Allowed } from "remult";
import { makeTitle } from "remult/src/column";
import { CoursesPage } from "./Courses/CoursesPage";
import { StudentsInCoursePage } from "./Courses/StudentsInCoursePage";
import { Home } from "./Home/Home";
import { StudentsPage } from "./Students/StudentsPage";
import { Roles } from "./Users/Roles";
import { UsersPage } from "./Users/UsersPage";

import { remult } from "./common";
import { Course } from "./Courses/Course.entity";
import { FieldsInput } from "./Utils/FormDialog";

const routes: {
    path: string,
    element: FunctionComponent,
    title?: string,
    allowed?: Allowed
}[] = [
        { path: '', element: Home, title: 'Home' },
        { path: 'Users', element: UsersPage, title: 'מורים', allowed: Roles.admin },
        { path: 'Courses', element: CoursesPage, title: 'חוגים', allowed: Roles.admin },
        { path: 'Students', element: StudentsPage, title: 'תלמידים', allowed: Roles.admin },
        { path: 'Play', element: Play },
        { path: 'StudentsInCourse/:id', element: StudentsInCoursePage, title: 'תלמידים בחוג', allowed: Roles.admin }
    ]

for (const route of routes) {
    if (!route.title) {
        route.title = makeTitle(route.path);
    }
}

export default routes;

function Play() {
    const c = useMemo(() => remult.repo(Course).create(), []);
    return <>
        <FieldsInput fields={[c.$.name,c.$.teacher!]} />
        

    </>
}
function Test() {
    return (<OutlinedInput />)
}