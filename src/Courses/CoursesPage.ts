import { remult } from "../common";
import { User } from "../Users/User.entity";
import { uiTools } from "../Utils/FormDialog";
import { DeleteRowAction, AddRowAction, MyGrid } from "../Utils/useMuiGrid";
import { Course } from "./Course.entity";
import { StudentsInCoursePage } from "./StudentsInCoursePage";

export function CoursesPage() {
    return MyGrid<Course>(remult.repo(Course), {
        editOnClick: true,
        gridActions: [AddRowAction],
        rowActions: [{
            caption: 'תלמידים',
            click: async ({ row }) => {
                uiTools.navigate(StudentsInCoursePage, row.id);
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
        fields: u => [u.name, u.town,u.teacher!],
    });
}

