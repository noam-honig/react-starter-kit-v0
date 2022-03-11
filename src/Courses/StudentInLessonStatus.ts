import { ValueListFieldType } from "remult";


@ValueListFieldType()
export class StudentInLessonStatus {

    static none: StudentInLessonStatus = new StudentInLessonStatus("", "טרם עודכן", {
        onClickChangeTo: () => StudentInLessonStatus.attended,
        icon: c => c.uncheckedBox()
    });
    static attended = new StudentInLessonStatus("v", "נכח", {
        onClickChangeTo: () => StudentInLessonStatus.none,
        icon: c => c.checkedBox(),
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
    icon: (select: StatusIcon) => void = s => s.chars(this.id);
    askForComment = false;
    stats = (stats: MonthStatisticsResult) => { }

    constructor(public id: string, public caption: string, args?: Partial<StudentInLessonStatus>) {
        if (args)
            Object.assign(this, args);
    }
}

export interface MonthStatisticsResult {
    studentId: string;
    lessons: number;
    missingOk: number;
    canceled: number;
}

export interface StatusIcon {
    checkedBox(): void;
    uncheckedBox(): void;
    chars(chars: string): void;
}