import { Avatar, ListItemAvatar, ListItemIcon, styled, useTheme } from "@mui/material";
import { ReactElement } from "react";
import { ValueListFieldType } from "remult";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Student } from "../Students/Student.entity";

@ValueListFieldType()
export class StudentInLessonStatus {

    static none: StudentInLessonStatus = new StudentInLessonStatus("", "טרם עודכן", {
        onClickChangeTo: () => StudentInLessonStatus.attended,
        icon: <CheckBoxOutlineBlankIcon />
    });
    static attended = new StudentInLessonStatus("v", "נכח", {
        onClickChangeTo: () => StudentInLessonStatus.none,
        icon: <CheckBoxIcon />,
        stats: s => s.lessons++,
    });
    static missingOk = new StudentInLessonStatus("x", "הודיע שלא יגיע", {
        askForComment: true,
        stats: s => s.missingOk++,
    });
    static mssingBad = new StudentInLessonStatus("xx", "ביטל ברגע האחרון", {
        askForComment: true,
        stats: s => s.lessons++,
    });
    static double = new StudentInLessonStatus("vv", "שעור כפול", {
        stats: s => s.lessons += 2,
    });
    static canceled = new StudentInLessonStatus("vx", "בוטל על ידינו", {
        askForComment: true,
        stats: s => s.canceled++,
    });



    onClickChangeTo: () => StudentInLessonStatus = () => this;
    icon: ReactElement = undefined!;
    askForComment = false;

    stats = (stats: MonthStatisticsResult) => {

    }
    constructor(public id: string, public caption: string, args?: Partial<StudentInLessonStatus>) {

        {
            if (args)
                Object.assign(this, args);
            const IconWithColor = () => {
                const theme = useTheme();
                const CustomizedListItemIcon = styled('span')`
                color:${theme.palette.primary.main}
                `
                return (
                    <CustomizedListItemIcon>
                        {args?.icon ? args.icon : id.toUpperCase()}
                    </CustomizedListItemIcon>)
            }
            this.icon = <IconWithColor />
        }
    }
}

export interface MonthStatisticsResult {
    studentId: string;
    lessons: number;
    missingOk: number;
    canceled: number;
}
