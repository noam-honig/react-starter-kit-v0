import { Entity, Field, IdEntity, Validators, ValueListFieldType } from "remult";
import { Group } from "../Courses/Course.entity";




@Entity("students", {
    caption: 'תלמיד',
    allowApiCrud: true,
    defaultOrderBy: { order: 'asc' }
})
export class Student extends IdEntity {
    @Field({ caption: 'שם פרטי', validate: Validators.required.withMessage("חסר ערך") })
    firstName: string = '';
    @Field({ caption: 'שם משפחה', validate: Validators.required.withMessage("חסר ערך") })
    lastName: string = '';
    get fullName() { return this.firstName + " " + this.lastName; }
    @Field({ caption: 'שם הורה' })
    parentName: string = '';
    @Field({ caption: 'טלפון הורה', validate: Validators.required.withMessage("חסר ערך") })
    parentPhone: string = '';
    @Field({dbName:'theOrder'})
    order: number = 0;

    @Field({
        
        caption: 'סוג שעור', validate: (x, col) => {
            if (!col.value?.id) {
                col.error = "חסר ערך";
            }
        }
    }, o => o.valueType = LessonType)
    lessonType!: LessonType;

    @Field({ caption: 'קבוצה' ,dbName:"theGroup"}, o => o.valueType = Group)
    group!: Group;


}




export class LessonType {
    constructor(public id: number, public caption: string) { }
    static m30 = new LessonType(30, "30 דקות");
    static m45 = new LessonType(45, "45 דקות");
}
ValueListFieldType(LessonType)(LessonType)