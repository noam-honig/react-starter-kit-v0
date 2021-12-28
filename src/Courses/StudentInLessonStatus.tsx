import { Avatar, ListItemAvatar, ListItemIcon, styled, useTheme } from "@mui/material";
import { ReactElement } from "react";
import { ValueListFieldType } from "remult";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

@ValueListFieldType()
export class StudentInLessonStatus {
    static none: StudentInLessonStatus = new StudentInLessonStatus("", "טרם עודכן", () => StudentInLessonStatus.attended, <CheckBoxOutlineBlankIcon />);
    static attended = new StudentInLessonStatus("v", "נכח", () => StudentInLessonStatus.none, <CheckBoxIcon />);
    static missingOk = new StudentInLessonStatus("x", "הודיע שלא יגיע");
    static mssingBad = new StudentInLessonStatus("xx", "ביטל ברגע האחרון");
    static double = new StudentInLessonStatus("vv", "שעור כפול");
    static canceled = new StudentInLessonStatus("vx", "בוטל על ידינו");


    constructor(public id: string, public caption: string, public onClickChangeTo: () => StudentInLessonStatus = () => this, public icon: ReactElement = undefined!) {

        {
            const IconWithColor = () => {
                const theme = useTheme();
                const CustomizedListItemIcon = styled(ListItemIcon)`
                color:${theme.palette.primary.main}
                `
                return (
                    <CustomizedListItemIcon>
                        {icon?icon:id.toUpperCase()}
                    </CustomizedListItemIcon>)
            }
            this.icon = <IconWithColor />
        }
    }
}
