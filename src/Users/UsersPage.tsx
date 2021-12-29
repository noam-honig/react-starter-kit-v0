
import { Button } from "@mui/material";
import { useContext } from "react";
import { RemultContext } from "../common";
import { TeacherGroupsPage } from "../Home/TeacherGroupsPage";
import { openDialog, showInfo } from "../Utils/StackUtils";
import { DeleteRowAction, AddRowAction, MyGrid } from "../Utils/useMuiGrid";
import { User } from "./User.entity";
import copy from 'copy-to-clipboard';





export function UsersPage() {
    const remult = useContext(RemultContext);
    return MyGrid<User>(remult.repo(User), {
        editOnClick: true,
        gridActions: [AddRowAction],
        rowActions: [{
            caption: "העתק קישור כניסה למורה",
            click: async ({ row }) => {
                copy(window.location.origin + "/?token=" + row.id);
                showInfo("הקישור הועתק");
            }
        },
        {
            caption: "קבוצות למורה",
            click: async ({ row }) => {
                openDialog(close => (
                    <>
                        <TeacherGroupsPage teacherId={row.id} />
                        <Button onClick={close}>סגור</Button>
                    </>
                ))
            }
        }
        ],
        fields: u => [u.name, u.instrument, u.phone, u.email, u.admin],
        editFields: u => [u.name, u.instrument, u.phone, u.email, u.price30, u.price45, u.priceBand, u.priceTravel, u.admin]

    });
}

