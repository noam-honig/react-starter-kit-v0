import { FunctionComponent } from "react";
import { Allowed } from "remult";
import { makeTitle } from "remult/src/column";
import { AllSummaryView } from "./Home/AllSummaryView";

import { StudentsPage } from "./Students/StudentsPage";
import { Roles } from "./Users/Roles";
import { UsersPage } from "./Users/UsersPage";
import CompareMarvelX from "./Home/CompareMarvelX";

const routes: {
  path: string;
  element: FunctionComponent;
  title?: string;
  allowed?: Allowed;
}[] = [
  { path: "", element: UsersPage, title: "מורים", allowed: Roles.admin },
  {
    path: "summary",
    element: AllSummaryView,
    title: "סיכום כללי",
    allowed: Roles.admin,
  },
  { path: "dev", element: CompareMarvelX, allowed: Roles.admin },
];

for (const route of routes) {
  if (!route.title) {
    route.title = makeTitle(route.path);
  }
}

export default routes;
