
import { Button } from "@mui/material";
import { useContext } from "react";
import { RemultContext } from "../common";
import { TeacherGroupsPage } from "../Home/TeacherGroupsPage";
import { openDialog, showInfo } from "../Utils/StackUtils";
import { DeleteRowAction, AddRowAction, MyGrid } from "../Utils/useMuiGrid";
import { TeacherRate, User } from "./User.entity";
import copy from 'copy-to-clipboard';
import { GroupType } from "../Courses/Group.entity";





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
        },
        {
            caption: "אפס סיסמה למורה",
            click: async ({ row }) => {
                row.password = '';
                await row.save();
                showInfo("סיסמה אופסה");
            }
        }
        ],
        fields: u => [u.name, u.instrument, u.phone, u.email, u.admin, u.removed],
        customEdit:
            async (row, uiTools) => {
                const u = row.$;
                const teacherRates = await remult.repo(TeacherRate).find({ where: { teacherId: row.id } });
                console.table(teacherRates);

                const rates = GroupType.helper.getOptions().filter(x => x.isGroup).map(g => teacherRates.find(x => x.groupType.id == g.id) || remult.repo(TeacherRate).create({
                    teacherId: row.id, groupType: g
                }));
                await uiTools.formDialog({
                    title: row.isNew() ?
                        "הוסף" :
                        'ערוך ' +
                        'מורה',
                    fields: [u.name, u.instrument, u.phone, u.email, u.priceTravel, u.price30, u.price45, ...rates.map(x => (
                        {
                            field: x.$.price,
                            caption: 'מחיר לשעור ' + x.groupType.caption
                        }
                    )), u.admin, u.removed],
                    ok: async () => {
                        await row.save();
                        for (const rate of rates) {
                            if (!rate.isNew() || rate.price > 0) {
                                rate.teacherId = row.id;
                                await rate.save();
                            }
                        }

                    },
                    cancel: () => row._.undoChanges()
                });

            }

    });
}

