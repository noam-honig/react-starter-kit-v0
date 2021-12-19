import { useContext } from "react";
import { RemultContext } from "../common";
import { User } from "../Users/User.entity";
import { uiTools } from "../Utils/FormDialog";
import { DeleteRowAction, AddRowAction, MyGrid } from "../Utils/useMuiGrid";
import { Course } from "./Course.entity";
import { CourseDetailsPage } from "./CourseDetailsPage";

export function CoursesPage() {
    
    const remult = useContext(RemultContext);
    return MyGrid<Course>(remult.repo(Course), {
        editOnClick: true,
        gridActions: [AddRowAction],
        rowActions: [{
            caption: 'תלמידים',
            click: async ({ row }) => {
                uiTools.navigate(CourseDetailsPage, row.id);
            }
        }, {
            caption: 'בחר מורה',
            click: async ({ row, utils }) => {
                let u = await remult.repo(User).findFirst();
                row.teacher = u;
                await row.save();
                utils.renderRows();
            }
        }, DeleteRowAction],
        fields: u => [u.name, u.town, u.teacher!],
    });
}

