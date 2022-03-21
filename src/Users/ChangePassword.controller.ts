import { BackendMethod, Controller, Field, Validators, ControllerBase } from "remult";
import { User } from "./User.entity";
import '../Utils/AugmentRemult';
import { UITools } from "../Utils/AugmentRemult";
import { Roles } from "./Roles";

@Controller("changePassword")
export class ChangePassword extends ControllerBase {
    @Field({
        validate: Validators.required,
        inputType: 'password', caption: 'סיסמה'
    })
    password: string = '';

    @Field<ChangePassword>({
        validate: self => {
            if (self.password !== self.confirmPassword)
                self.$.confirmPassword.error = "אינה תואמת את ה " + self.$.password.metadata.caption
        },
        caption: 'אישור סיסמה',
        inputType: 'password'
    })
    confirmPassword: string = '';

    show(ui: UITools) {
        ui.formDialog({
            title: "עדכון סיסמה",
            fields: [...this.$],
            ok: async () => {
                await this.updatePassword();
            }
        });
    }
    @BackendMethod({ allowed: Roles.admin })
    async updatePassword() {
        let admin = false;
        if ((await this.remult.repo(User).count()) === 0)
            admin = true;// If it's the first user, make it an admin

        let user = await this.remult.repo(User).findId(this.remult.user.id);
        user.hashAndSetPassword(this.password);
        await user.save();

    }

}

