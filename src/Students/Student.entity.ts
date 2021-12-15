import { Entity, Field, Filter, IdEntity } from "remult";
import { StudentInCourse } from "../Courses/Course.entity";

@Entity("students", {
    caption:'תלמיד',
    allowApiCrud: true,
    defaultOrderBy: { name: 'asc' }
})
export class Student extends IdEntity {
    @Field({ caption: 'שם התלמיד' })
    name: string = '';
    @Field({ caption: 'שם הורה' })
    parentName: string = '';
    @Field({ caption: 'טלפון הורה' })
    parentPhone: string = '';

    static inCourse = Filter.createCustom<Student, string>(async (remult, courseId) => {
        let ids = await remult.repo(StudentInCourse).find({ where: { courseId } });
        return {
            id: ids.map(x => x.studentId)
        }
    });
} 