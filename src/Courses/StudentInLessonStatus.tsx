import { Avatar, ListItemAvatar, ListItemIcon, styled, useTheme } from "@mui/material";
import { ReactElement } from "react";
import { ValueListFieldType } from "remult";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

@ValueListFieldType()
export class StudentInLessonStatus {
    static none: StudentInLessonStatus = new StudentInLessonStatus("", "טרם עודכן", {
        onClickChangeTo: () => StudentInLessonStatus.attended,
        icon: <CheckBoxOutlineBlankIcon />
    });
    static attended = new StudentInLessonStatus("v", "נכח", {
        onClickChangeTo: () => StudentInLessonStatus.none,
        icon: <CheckBoxIcon />
    });
    static missingOk = new StudentInLessonStatus("x", "הודיע שלא יגיע", {
        askForComment: true
    });
    static mssingBad = new StudentInLessonStatus("xx", "ביטל ברגע האחרון", {
        askForComment: true
    });
    static double = new StudentInLessonStatus("vv", "שעור כפול", {
        
    });
    static canceled = new StudentInLessonStatus("vx", "בוטל על ידינו", {
        askForComment: true
    });



    onClickChangeTo: () => StudentInLessonStatus = () => this;
    icon: ReactElement = undefined!;
    askForComment = false;
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
