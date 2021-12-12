
import { IdEntity, Entity, Field, Validators, Allow, UserInfo } from "remult";
import { generate, verify } from 'password-hash';
import * as jwt from 'jsonwebtoken';
import { Roles } from "./Roles";

@Entity<User>("Users", {
    allowApiRead: Allow.authenticated,
    allowApiUpdate: Allow.authenticated,
    allowApiDelete: Roles.admin,
    allowApiInsert: Roles.admin
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
export class User extends IdEntity {

    @Field({
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
        allowApiUpdate: Roles.admin
    })
    admin: Boolean = false;

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

}
export function getJwtTokenSignKey() {
    if (process.env.NODE_ENV === "production")
        return process.env.TOKEN_SIGN_KEY!;
    return "my secret key";
}