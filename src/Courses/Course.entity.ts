import { DateOnlyField, Entity, Field, Filter, IdEntity, OneToMany, Remult, EntityFilter } from "remult";
import { Student } from "../Students/Student.entity";
import { User } from "../Users/User.entity";



@Entity("Groups", {
    allowApiCrud: true,
    caption: 'חוג',

})
export class Group extends IdEntity {
    @Field({ caption: 'שם הקבוצה' })
    name: string = '';
    @Field({ caption: 'ישוב' })
    town: string = '';
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
    caption: "לתמיד בשיעור"
})
export class StudentInLesson extends IdEntity {
    @Field()
    lessonId: string = '';
    @Field()
    studentId: string = '';
    @Field()
    attended: boolean = false;
}