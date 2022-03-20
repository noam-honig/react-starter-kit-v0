import { AppBar, Avatar, Button, Checkbox, Divider, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Slide, Stack, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { Fragment, useMemo, useState } from "react";
import { useRemult } from "../common";
import { Group, GroupType } from "../Courses/Group.entity";
import { useEntityArray, useEntityQuery } from "../Utils/useEntityQuery";
import { TeacherRate, User } from "../Users/User.entity";
import { uiTools } from "../Utils/FormDialog";
import EditIcon from '@mui/icons-material/Edit';

import { FieldRef } from "remult";

import { SummaryView } from "./SummaryView";
import { GroupStudents } from "./GroupStudents";
import { Loading } from "./Loading";
import { FormField } from "../Utils/AugmentRemult";

export function TeacherGroupsPage({ teacherId }: { teacherId: string }) {
    const remult = useRemult();
    const currentUser = useEntityQuery(() => remult.repo(User).findId(teacherId, { useCache: false }), [teacherId]);
    const groups = useEntityArray(() =>
        !currentUser.data ? undefined :
            remult.repo(Group).find({
                where: {
                    teacher: currentUser.data
                }
            }), [currentUser.data]);


    const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(undefined);
    const [showStats, setShowStats] = useState(false);
    const editGroup = async (g: Group) => {
        let fields: (FieldRef<Group> | FormField)[] = [g.$.name, g.$.town];
        const rates = await remult.repo(TeacherRate).find({ where: { teacherId: currentUser.data?.id, price: { ">": 0 } } });
        if (rates.length > 0) {
            fields.push({
                field: g.$.groupType,
                options: [GroupType.oneOnOne, ...rates.map(x => x.groupType)]
            })
        }
        await uiTools.formDialog({
            title: g.isNew() ? "הוסף קבוצה חדשה" :
                "עדכן קבוצה",
            fields,
            ok: async () => {
                await g.save();
            }
        });
    }



    return Loading([groups, currentUser], (<>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {groups.data?.map(group => (
                <Fragment key={group.id}>
                    <ListItem
                        secondaryAction={
                            <IconButton edge="end" onClick={(e) => editGroup(group)}>
                                <EditIcon />
                            </IconButton>
                        }>
                        <ListItemButton role={undefined} onClick={() => setSelectedGroup(group)}>
                            <ListItemText primary={group.name} secondary={group.groupType.caption + ', ' + group.town} />
                        </ListItemButton>
                    </ListItem>
                    <Divider component="li" />
                </Fragment>
            ))}
        </List>
        <Stack alignItems="center" spacing={2} sx={{ p: 1 }}>

            <Button variant="contained" color="success" onClick={() => setShowStats(true)}>הצג סיכום חודשי</Button>
            <Button variant="contained" onClick={async () => {
                const g = remult.repo(Group).create({ teacher: currentUser.data });
                await editGroup(g);
                if (!g.isNew())
                    groups.add(g);
            }}>הוסף קבוצה חדשה</Button>
        </Stack>



        <GroupStudents selectedGroup={selectedGroup} handleClose={() => setSelectedGroup(undefined)} />
        <SummaryView teacher={currentUser.data!} open={showStats} onClose={() => setShowStats(false)} />


    </>))
}

export const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="right" ref={ref} {...props} />;
});
