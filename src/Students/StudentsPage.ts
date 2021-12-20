
import { useContext } from "react";
import { RemultContext } from "../common";
import { DeleteRowAction, AddRowAction, MyGrid } from "../Utils/useMuiGrid";
import { Student } from "./Student.entity";


export function StudentsPage() {
    const remult = useContext(RemultContext);
    return MyGrid<Student>(remult.repo(Student), {
        editOnClick: true,
        gridActions: [AddRowAction],
        rowActions: [DeleteRowAction],
        fields: u => [u.firstName, u.parentName, u.parentPhone],
    });
}

