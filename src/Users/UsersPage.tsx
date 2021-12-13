import { remult } from "../common";
import { DeleteRowAction, AddRowAction, MyGrid } from "../Utils/useMuiGrid";
import { User } from "./User.entity";





export function UsersPage() {
    return MyGrid<User>(remult.repo(User), {
        editOnClick: true,
        gridActions: [AddRowAction],
        rowActions: [DeleteRowAction],
        fields: u => [u.name, u.instrument, u.phone, u.email, u.admin],
    });
}

