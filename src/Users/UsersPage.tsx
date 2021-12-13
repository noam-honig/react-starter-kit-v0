import { remult } from "../common";
import { DeleteRowAction, AddRowAction, MyGrid } from "../Utils/useMuiGrid";
import { User } from "./User";





export function UsersPage() {
    return MyGrid(remult.repo(User), {
        editOnClick: true,
        gridActions: [AddRowAction],
        rowActions: [DeleteRowAction],
        fields: u => [u.name, u.admin],
    });
}

