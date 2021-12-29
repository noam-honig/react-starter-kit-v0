import { DateOnlyField, Entity, Field, Filter, IdEntity, OneToMany, Remult, EntityFilter, ValueListFieldType } from "remult";
import { Student } from "../Students/Student.entity";
import { User } from "../Users/User.entity";
import { StudentInLessonStatus } from "./StudentInLessonStatus";



@Entity("Groups", {
    allowApiCrud: true,
    caption: 'חוג',

})
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

@Entity("studentsInDate", {
    allowApiCrud: true,
    caption: "תלמיד בשיעור"
})
export class StudentInLesson extends IdEntity {
    @DateOnlyField()
    date!: Date;
    @Field()
    studentId: string = '';
    @Field(o => o.valueType = StudentInLessonStatus)
    status: StudentInLessonStatus = StudentInLessonStatus.none;
    @Field({ caption: 'הערה',inputType:"area" })
    note: string = '';
}

