import { DateOnlyField, Entity, Field, Filter, IdEntity, OneToMany, Remult, EntityFilter } from "remult";
import { User } from "../Users/User.entity";



@Entity("courses", {
    allowApiCrud: true,
    caption: 'חוג',

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
    lessons = new OneToMany(this.remult.repo(Lesson), {
        where: {
            course: this
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

@Entity("Lessons", {
    allowApiCrud: true,
    caption: 'שעור'
})
export class Lesson extends IdEntity {
    @Field(o => o.valueType = Course)
    course!: Course;
    @DateOnlyField()
    date!: Date;
    static currentUser = Filter.createCustom<Lesson>(async remult => {
        let currentUser = await remult.repo(User).findId(remult.user.id);
        if (currentUser) {
            let teacherCourses = await remult.repo(Course).find({
                where: {
                    teacher: currentUser
                }
            })
            return {
                course: teacherCourses
            };
        }
        else return {
            id: []

        }
    });

}
@Entity("studentsInLesson", {
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
@Entity("studentsInCourse", {
    allowApiCrud: true,
    caption: "תלמיד בחוג"
})
export class StudentInCourse extends IdEntity {
    @Field()
    courseId: string = '';
    @Field()
    studentId: string = '';
}
