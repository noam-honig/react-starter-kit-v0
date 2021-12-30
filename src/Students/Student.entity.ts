import { Entity, Field, IdEntity, Validators, ValueListFieldType } from "remult";
import { Group } from "../Courses/Group.entity";
import { User } from "../Users/User.entity";
import { uiTools } from "../Utils/FormDialog";




@ValueListFieldType()
export class LessonLength {

    constructor(public id: number, public caption: string, public getPrice: (teacher: User) => number) { }
    static m30 = new LessonLength(30, "30 דקות", t => t.price30);
    static m45 = new LessonLength(45, "45 דקות", t => t.price45);
}

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
    @Field({ caption: 'טלפון' })
    phone: string = '';
    get fullName() { return this.firstName + " " + this.lastName; }
    @Field({ caption: 'שם הורה' })
    parentName: string = '';
    @Field({ caption: 'טלפון הורה' })
    parentPhone: string = '';
    @Field({ dbName: 'theOrder' })
    order: number = 0;
    @Field({ caption: 'סוג שעור' })
    type: string = '';
    @Field({
        caption: 'אורך שעור'
    }, o => o.valueType = LessonLength)
    lessonLength: LessonLength = LessonLength.m30;

    @Field({ caption: 'קבוצה', dbName: "theGroup" }, o => o.valueType = Group)
    group!: Group;

    editDialog(ok: () => any) {
        uiTools.formDialog({
            title: (this.isNew() ? "הוסף" : "עדכן") + " תלמיד",
            fields: [this.$.firstName, this.$.lastName, this.$.phone, this.$.type, this.$.lessonLength, this.$.parentName, this.$.parentPhone],
            ok: async () => {
                await this.save();
                if (ok)
                    ok();

            }
        });
    }


}



