import { group } from "console";
import { Entity, Field, Filter, IdEntity, Validators, ValueListFieldType } from "remult";
import { Group } from "../Courses/Group.entity";
import { Roles } from "../Users/Roles";
import { User } from "../Users/User.entity";
import { uiTools } from "../Utils/FormDialog";




@ValueListFieldType()
export class LessonLength {

    constructor(public id: number, public caption: string, public getPrice: (teacher: User) => number) { }
    static m30 = new LessonLength(30, "30 דקות", t => t.price30);
    static m45 = new LessonLength(45, "45 דקות", t => t.price45);
}

@Entity<Student>("students", {
    caption: 'תלמיד',
    allowApiCrud: true,
    defaultOrderBy: { order: 'asc' }
},
    (options, remult) => options.backendPrefilter = async () => {
        if (remult.isAllowed(Roles.admin))
            return {};
        else return { group: await remult.repo(Group).find() }
    }
)

export class Student extends IdEntity {
    @Field({ caption: 'שם פרטי', validate: Validators.required.withMessage("חסר ערך") })
    firstName: string = '';
    @Field({ caption: 'שם משפחה', validate: Validators.required.withMessage("חסר ערך") })
    lastName: string = '';
    @Field({ caption: 'טלפון' })
    phone: string = '';
    get fullName() { return this.firstName + " " + this.lastName; }
    @Field({ caption: 'סוג שעור' })
    type: string = '';
    @Field({
        caption: 'אורך שעור'
    }, o => o.valueType = LessonLength)
    lessonLength: LessonLength = LessonLength.m30;
    @Field({ caption: 'שם הורה' })
    parentName: string = '';
    @Field({ caption: 'טלפון הורה' })
    parentPhone: string = '';

    @Field({ dbName: 'theOrder' })
    order: number = 0;
    @Field({ caption: 'קבוצה', dbName: "theGroup" }, o => o.valueType = Group)
    group!: Group;

    editDialog(ok: () => any) {
        uiTools.formDialog({
            title: (this.isNew() ? "הוסף" : "עדכן") + " תלמיד",
            fields: this.$.toArray().filter(f => ![this.$.order, this.$.group, this.$.id].find(x => x === f)),
            ok: async () => {
                await this.save();
                if (ok)
                    ok();

            },
            cancel: () => this._.undoChanges()
        });
    }
}



