
import { IdEntity, Entity, Field, Validators, Allow, UserInfo, FieldType } from "remult";
import { generate, verify } from 'password-hash';
import * as jwt from 'jsonwebtoken';
import { Roles } from "./Roles";
import { SelectDialog } from "../Utils/SelectDialog";


@Entity<User>("Users", {
    allowApiRead: Allow.authenticated,
    allowApiUpdate: Allow.authenticated,
    allowApiDelete: Roles.admin,
    allowApiInsert: Roles.admin,
    caption: 'מורים',
    defaultOrderBy: {
        name: 'asc'
    }
},
    (options, remult) => {
        //only admin can see all users, a regular user can only see their own details
        options.apiPrefilter = !remult.isAllowed(Roles.admin) ? { id: remult.user.id } : {};

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
        SelectDialog(User, {
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
    async passwordMatches(password: string) {
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

}
export function getJwtTokenSignKey() {
    if (process.env.NODE_ENV === "production")
        return process.env.TOKEN_SIGN_KEY!;
    return "my secret key";
}

