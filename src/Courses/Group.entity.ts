
import { DateOnlyField, Entity, Field, IdEntity, OneToMany, Remult, BackendMethod, Allow } from "remult";
import { DateOnlyValueConverter, ValueListValueConverter } from "remult/valueConverters";
import { LessonLength, Student } from "../Students/Student.entity";
import { Roles } from "../Users/Roles";
import { User } from "../Users/User.entity";
import { MonthStatisticsResult, StudentInLessonStatus } from "./StudentInLessonStatus";



@Entity<Group>("Groups", {
    allowApiCrud: Allow.authenticated,
    caption: 'חוג'
}, (options, remult) => options.backendPrefilter = () => {
    if (remult.isAllowed(Roles.admin))
        return {};
    return { teacher: { $id: [remult.user.id] } }
}

)
export class Group extends IdEntity {
    @Field({ caption: 'שם הקבוצה' })
    name: string = '';
    @Field({ caption: 'ישוב' })
    town: string = '';
    @Field({
        caption: "להקה?",
        valueType: Boolean
    })
    isBand: boolean = false;
    students = new OneToMany(this.remult.repo(Student), {
        where: {
            group: this
        }
    });

    @Field({
        caption: 'מורה'
    }, o => o.valueType = User)
    teacher?: User;
    constructor(private remult: Remult) {
        super();
    }
}

@Entity<StudentInLesson>("studentsInDate", {
    allowApiCrud: true,
    caption: "תלמיד בשיעור"
},
    (options, remult) => options.backendPrefilter = async () => {
        if (remult.isAllowed(Roles.admin))
            return {};
        return { studentId: await remult.repo(Student).find().then(r => r.map(s => s.id)) }
    }
)
export class StudentInLesson extends IdEntity {
    @DateOnlyField()
    date!: Date;
    @Field()
    studentId: string = '';
    @Field(o => o.valueType = StudentInLessonStatus)
    status: StudentInLessonStatus = StudentInLessonStatus.none;
    @Field({ caption: 'הערה', inputType: "area" })
    note: string = '';


    @BackendMethod({ allowed: Allow.authenticated })
    static async monthStatistics(teacherId: string, month: string, remult?: Remult) {
        const teacher = await remult!.repo(User).findId(teacherId);
        const fromDate = DateOnlyValueConverter.fromInput!(month + '-01', 'date');
        const toDate = new Date(fromDate);
        toDate.setMonth(toDate.getMonth() + 1);
        const counters = new Map<LessonLength, number>();
        let band = 0;
        let totalDates = 0;
        const studentStats: MonthStatisticsResult[] = [];
        const groupStats: GroupDates[] = [];

        for (const g of await remult!.repo(Group).find({ where: { teacher: { $id: [teacherId] } } })) {
            const gStats: GroupDates = {
                groupId: g.id,
                dates: 0
            };
            groupStats.push(gStats);
            let dates: { [key: number]: boolean } = {};
            for (const s of await g.students.load()) {
                let stats: MonthStatisticsResult = {
                    studentId: s.id,
                    lessons: 0,
                    canceled: 0,
                    missingOk: 0
                };
                studentStats.push(stats);
                for (const l of await remult!.repo(StudentInLesson).find({ where: { studentId: s.id, date: { ">=": fromDate, "<": toDate } } })) {
                    l.status.stats(stats);
                    if (l.status != StudentInLessonStatus.none)
                        if (!dates[l.date.valueOf()]) {
                            dates[l.date.valueOf()] = true;
                            gStats.dates++;
                        }
                }
                if (!g.isBand) {
                    let total = counters.get(s.lessonLength) ?? 0;
                    total += stats.lessons;
                    counters.set(s.lessonLength, total);
                }
            }
            if (g.isBand)
                band += gStats.dates;
            totalDates += gStats.dates;

        }
        const totals: Totals[] = [];
        for (const t of new ValueListValueConverter(LessonLength).getOptions()) {
            totals.push({
                caption: t.caption,
                count: counters.get(t) || 0,
                price: t.getPrice(teacher)
            })
        }
        if (band > 0) {
            totals.push({
                caption: "להקות",
                count: band,
                price: teacher.priceBand
            })
        }
        if (teacher.priceTravel > 0) {
            totals.push({
                caption: "נסיעות",
                count: totalDates,
                price: teacher.priceTravel
            })
        }
        return {
            groupStats,
            studentStats,
            totals
        };
    }
}

export interface GroupDates {
    groupId: string;
    dates: number;
}
export interface Totals {
    caption: string,
    count: number,
    price: number
}