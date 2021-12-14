import { remult } from "../common";
import { DeleteRowAction, AddRowAction, MyGrid } from "../Utils/useMuiGrid";
import { Student } from "./Student.entity";


export function StudentsPage() {
    return MyGrid<Student>(remult.repo(Student), {
        editOnClick: true,
        gridActions: [AddRowAction],
        rowActions: [DeleteRowAction],
        fields: u => [u.name, u.parentName, u.parentPhone],
    });
}

