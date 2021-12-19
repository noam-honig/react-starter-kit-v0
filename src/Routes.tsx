import { FunctionComponent } from "react";
import { Allowed } from "remult";
import { makeTitle } from "remult/src/column";
import { CoursesPage } from "./Courses/CoursesPage";
import { CourseDetailsPage } from "./Courses/CourseDetailsPage";
import { Home } from "./Home/Home";
import { StudentsPage } from "./Students/StudentsPage";
import { Roles } from "./Users/Roles";
import { UsersPage } from "./Users/UsersPage";

const routes: {
    path: string,
    element: FunctionComponent,
    title?: string,
    allowed?: Allowed
}[] = [
        { path: '', element: Home, title: 'שיעורים קרובים' },
        { path: 'Users', element: UsersPage, title: 'מורים', allowed: Roles.admin },
        { path: 'Courses', element: CoursesPage, title: 'חוגים', allowed: Roles.admin },
        { path: 'Students', element: StudentsPage, title: 'תלמידים', allowed: Roles.admin },
        { path: 'courseDetails/:id', element: CourseDetailsPage, title: 'פרטי חוג', allowed: Roles.admin }
    ]

for (const route of routes) {
    if (!route.title) {
        route.title = makeTitle(route.path);
    }
}

export default routes;

