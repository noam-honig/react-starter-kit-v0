import { DateOnlyField, Entity, Field, IdEntity } from "remult";

@Entity("courses", {
    allowApiCrud: true
})
export class Course extends IdEntity {
    @Field()
    name: string = '';
    @Field()
    town: string = '';
    
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
@Entity("students", {
    allowApiCrud: true
})
export class Student extends IdEntity {
    @Field()
    name: string = '';
    @Field()
    parentName: string = '';
    @Field()
    parentPhone: string = '';
}