import { DateOnlyField, Entity, Field, IdEntity, OneToMany, Remult } from "remult";
import { User } from "../Users/User.entity";


@Entity("courses", {
    allowApiCrud: true,
    caption: 'חוג'
})
export class Course extends IdEntity {
    @Field({ caption: 'שם החוג' })
    name: string = '';
    @Field({ caption: 'ישוב' })
    town: string = '';
    students = new OneToMany(this.remult.repo(StudentInCourse), {
        where: {
            courseId: this.id
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

@Entity("Classes", {
    allowApiCrud: true
})
export class Class extends IdEntity {
    @Field()
    courseId: string = '';
    @DateOnlyField()
    date!: Date;
}

@Entity("studentsInClass", {
    allowApiCrud: true
})
export class StudentInClass extends IdEntity {
    @Field()
    classId: string = '';
    @Field()
    studentId: string = '';
    @Field()
    attended: boolean = false;
}
@Entity("studentsInCourse", {
    allowApiCrud: true
})
export class StudentInCourse extends IdEntity {
    @Field()
    courseId: string = '';
    @Field()
    studentId: string = '';
}
