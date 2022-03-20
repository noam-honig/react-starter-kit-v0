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

export function SummaryView({ teacher, ...props }: { teacher: User, open: boolean, onClose: () => void }) {
    const [month, setMonth] = useState(() => DateOnlyValueConverter.toInput!(new Date(), 'date').substring(0, 7));

    return (
        <Dialog
            fullScreen
            open={props.open}
            onClose={(props.onClose)}
            TransitionComponent={Transition}
        >
            <Box sx={{ position: 'relative' }}>
                <Toolbar variant="dense">
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={props.onClose}
                        aria-label="close"
                    >
                        <ChevronRightIcon />
                    </IconButton>

                    <TextField type="month"
                        inputProps={{ style: { textAlign: 'right' } }} sx={{ m: 2 }}
                        label="חודש"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                    />
                </Toolbar>
                <Divider />
                <Info teacher={teacher} month={month} />

            </Box>
        </Dialog>);
}
const StyledTable = styled("table")`
border: 1px solid #ddd;
border-spacing: 0;
border-collapse: collapse;
margin:3px;
width:100%;
* tr > td,th {
    border: 1px solid #ddd;
    padding: 6px;
}
`;
function Info({ month, teacher }: { month: string, teacher: User }) {
    const remult = useRemult();
    const stats = useEntityQuery(() => StudentInLesson.monthStatistics(teacher.id, month), [teacher, month]);
    const groups = useEntityQuery(() => remult.repo(Group).find({
        where: {
            teacher
        }
    }).then(x => Promise.all(x.map(y => y.students.load().then(() => y)))), [teacher]);
    if (stats.loading || groups.loading)
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
                        <th>מספר</th>
                        <th>תעריף</th>
                        <th>סה"כ</th>
                    </thead>
                    <tbody>
                        {stats.data!.totals.map(t => (<tr key={t.caption}>
                            <td>
                                {t.caption}
                            </td>
                            <td>
                                {t.count}
                            </td>
                            <td>
                                {t.price}
                            </td>
                            <td>
                                {t.price * t.count}
                            </td>
                        </tr>))}
                        <tr>
                            <td colSpan={3}>סה"כ</td>
                            <th>{stats.data!.totals.reduce((x, t) => x + t.price * t.count, 0)}</th>
                        </tr>
                    </tbody>
                </StyledTable>
            </Paper>
            <Paper sx={{ p: 1, m: 1 }}>
                <Typography variant="h6">לפי תלמידים:</Typography>
                <StyledTable><thead>
                    <tr>
                        <th>שם</th>
                        <th>v</th>
                        <th>x</th>
                        <th>vx</th>
                    </tr>
                </thead>
                    <tbody>
                        {
                            groups.data!.map(group => {
                                const gStats = stats.data!.groupStats.find(gs => gs.groupId === group.id);
                                return (
                                    <Fragment key={group.id}>
                                        <tr>
                                            <th>{group.name}<Typography variant="body2" color="text.secondary">{group.groupType.caption + ', ' + group.town}</Typography></th>
                                            <th colSpan={3}>
                                                {gStats?.dates} ימי לימוד
                                            </th>
                                        </tr>
                                        {group.students.lazyItems.map(student => {
                                            let s = stats.data?.studentStats!.find(s => s.studentId == student.id);
                                            return (<tr key={student.id}>
                                                <td style={{ textDecoration: student.frozen ? 'line-through' : '' }}>{student.fullName}<div><Typography variant="body2" color="text.secondary">{student.type + ", " + student.lessonLength?.caption}</Typography></div></td>
                                                <td>{s?.lessons}</td>
                                                <td>{s?.missingOk}</td>
                                                <td>{s?.canceled}</td>
                                            </tr>)
                                        })}
                                    </Fragment>)
                            })
                        }
                    </tbody>
                </StyledTable>
            </Paper>
        </Typography >
    )
}
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="right" ref={ref} {...props} />;
});