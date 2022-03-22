
import { IdEntity, Entity, Field, Validators, Allow, UserInfo, FieldType, IntegerField, BackendMethod } from "remult";
import { generate, verify } from 'password-hash';
import * as jwt from 'jsonwebtoken';
import { Roles } from "./Roles";
import { SelectEntityDialog } from "../Utils/SelectDialog";
import { GroupType } from "../Courses/Group.entity";



@Entity<User>("Users", {
    allowApiRead: Allow.authenticated,
    allowApiUpdate: Allow.authenticated,
    allowApiDelete: Roles.admin,
    allowApiInsert: Roles.admin,
    caption: 'מורה',
    defaultOrderBy: {
        removed: "asc",
        name: 'asc'
    }
},
    (options, remult) => {
        //only admin can see all users, a regular user can only see their own details
        options.apiPrefilter = !remult.isAllowed(Roles.admin) ? { id: [remult.user.id] } : {};

        options.saving = async (user) => {
            if (user._.isNew()) {
                user.createDate = new Date();
            }
        }
    }

)
@FieldType<User>({
    displayValue: (x, y) => y.name,
    inputType: 'custom'
},
    (o) => o.userClickToSelectValue = async f => {
        SelectEntityDialog(User, {
            select: user => f.value = user
        })
    }
)
export class User extends IdEntity {

    @Field({
        caption: 'שם',
        validate: [Validators.required, Validators.uniqueOnBackend]
    })
    name: string = '';

    @Field({ includeInApi: false })
    password: string = '';
    hashAndSetPassword(password: string) {
        this.password = generate(password);
    }
    passwordMatches(password: string) {
        return !this.password || verify(password, this.password);
    }

    @Field({
        allowApiUpdate: false
    })
    createDate: Date = new Date();

    @Field({
        allowApiUpdate: Roles.admin,
        valueType: Boolean,
        caption: 'מנהל'
    })
    admin: boolean = false;

    getJwtToken() {
        let userInfo: UserInfo = {
            name: this.name,
            id: this.id,
            roles: []
        }
        if (this.admin)
            userInfo.roles.push(Roles.admin);
        return jwt.sign(userInfo, getJwtTokenSignKey());
    }


    @Field({ caption: 'כלי נגינה' })
    instrument: string = '';
    @Field({ caption: 'טלפון' })
    phone: string = '';
    @Field({ caption: 'דוא"ל' })
    email: string = '';
    @IntegerField({ caption: "מחיר לשעור 30 דק" })
    price30: number = 0;
    @IntegerField({ caption: "מחיר לשעור 45 דק" })
    price45: number = 0;
    @IntegerField({ caption: "מחיר לשעור להקה" })
    priceBand: number = 0;
    @IntegerField({ caption: "מחיר נסיעות ליום" })
    priceTravel: number = 0;
    @Field({ caption: 'הוסר', valueType: Boolean })
    removed: boolean = false;


    @BackendMethod({ allowed: Roles.admin })
    async resetPassword() {
        this.password = '';
        await this.save;
    }

}
export function getJwtTokenSignKey() {
    if (process.env.NODE_ENV === "production")
        return process.env.TOKEN_SIGN_KEY!;
    return "my secret key";
}



@Entity("teacherRates", {
    allowApiCrud: Roles.admin,
    allowApiRead: Allow.authenticated
})
export class TeacherRate extends IdEntity {
    @Field()
    teacherId: string = '';
    @Field(o => o.valueType = GroupType)
    groupType: GroupType = GroupType.band60;
    @Field({ includeInApi: Roles.admin })
    price: number = 0;
}