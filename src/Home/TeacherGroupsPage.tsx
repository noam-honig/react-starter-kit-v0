import { AppBar, Avatar, Button, Checkbox, Divider, Grid, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Slide, Stack, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { Fragment, useMemo, useState } from "react";
import { useRemult } from "../common";
import { Group } from "../Courses/Group.entity";
import { useEntityArray, useEntityQuery } from "../Utils/useEntityQuery";
import { User } from "../Users/User.entity";
import { uiTools } from "../Utils/FormDialog";

import { FieldRef } from "remult";

import { SummaryView } from "./SummaryView";
import { GroupStudents } from "./GroupStudents";
import { Loading } from "./Loading";

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



    return Loading([groups, currentUser], (<>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {groups.data?.map(group => (
                <Fragment key={group.id}>
                    <ListItemButton role={undefined} onClick={() => setSelectedGroup(group)}>
                        <ListItem >
                            <ListItemText primary={group.name} secondary={group.town} />
                        </ListItem>
                    </ListItemButton>
                    <Divider component="li" />
                </Fragment>
            ))}
        </List>
        <Stack alignItems="center" spacing={2} sx={{ p: 1 }}>

            <Button variant="contained" color="success" onClick={() => setShowStats(true)}>הצג סיכום חודשי</Button>
            <Button variant="contained" onClick={async () => {
                const g = remult.repo(Group).create({ teacher: currentUser.data });
                let fields: FieldRef<Group>[] = [g.$.name, g.$.town];
                if (currentUser.data!.priceBand > 0)
                    fields.push(g.$.isBand);
                uiTools.formDialog({
                    title: "הוסף קבוצה חדשה",
                    fields,
                    ok: async () => {
                        await g.save();
                        groups.add(g);
                    }
                });
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
