import { useParams } from "react-router-dom";
import { Allowed } from "remult";
import { makeTitle } from "remult/src/column";
import { Home } from "./Home/Home";
import { Roles } from "./Users/Roles";
import { UsersPage } from "./Users/UsersPage";
const routes: {
    path: string,
    element: React.ReactElement,
    title?: string,
    allowed?: Allowed
}[] = [
        { path: '', element: <Home />, title: 'Home' },
        { path: 'Users', element: <UsersPage />, allowed: Roles.admin }
    ]

for (const route of routes) {
    if (!route.title) {
        route.title = makeTitle(route.path);
    }
}

export default routes;
