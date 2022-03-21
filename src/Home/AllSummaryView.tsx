import { Box, CircularProgress, Dialog, Divider, IconButton, Paper, Slide, Stack, styled, TextField, Toolbar, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import { Fragment, useState } from "react";
import { DateOnlyValueConverter } from "remult/valueConverters";
import { useRemult } from "../common";
import { Group, StudentInLesson } from "../Courses/Group.entity";
import { User } from "../Users/User.entity";
import { useEntityQuery } from "../Utils/useEntityQuery";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { StyledTable, SummaryView } from "./SummaryView";


export function AllSummaryView() {
    const [month, setMonth] = useState(() => DateOnlyValueConverter.toInput!(new Date(), 'date').substring(0, 7));
    return (<Box sx={{ position: 'relative' }}>
        <Toolbar variant="dense">


            <TextField type="month"
                inputProps={{ style: { textAlign: 'right' } }} sx={{ m: 2 }}
                label="חודש"
                value={month}
                onChange={e => setMonth(e.target.value)}
            />
        </Toolbar>
        <Divider />
        <Info month={month} />

    </Box>)
}
function Info({ month }: { month: string }) {
    const remult = useRemult();
    const teachersStats = useEntityQuery(() => StudentInLesson.allStatistics(month), [month]);
    const [zoomTeacher, setZoomTeacher] = useState<User>();
    const titles: string[] = [];
    if (teachersStats.data)
        for (const t of teachersStats.data) {
            let prev: string = undefined!;
            for (const stat of t.stats) {
                if (!titles.includes(stat.caption)) {
                    titles.splice(titles.indexOf(prev) + 1, 0, stat.caption);
                }
                prev = stat.caption;
            }
        }

    if (teachersStats.loading || !teachersStats.data)
        return (
            <Stack alignItems="center" spacing={2}>
                <CircularProgress color="primary" />
            </Stack>
        )
    return (

        <Typography variant="body1">
            <Paper sx={{ p: 1, m: 1 }}>
                <Typography variant="h6">סה"כ</Typography>
                <StyledTable>
                    <thead>
                        <th></th>
                        {titles.map(t => (<th key={t}>{t}</th>))}

                        <th>סה"כ</th>
                    </thead>
                    <tbody>
                        {teachersStats.data!.map(t => (<tr key={t.id} onClick={() => remult.repo(User).findId(t.id).then(setZoomTeacher)}>
                            <td>
                                {t.name}
                            </td>
                            {titles.map(total => (<th key={total}>{t.stats.find(s => s.caption === total)?.count}</th>))}
                            <th>{t.stats.reduce((x, t) => x + t.price * t.count, 0)}</th>
                        </tr>))}

                    </tbody>
                </StyledTable>
            </Paper>
            <SummaryView teacher={zoomTeacher!} open={!!zoomTeacher} onClose={() => setZoomTeacher(undefined)} />
        </Typography >
    )
}