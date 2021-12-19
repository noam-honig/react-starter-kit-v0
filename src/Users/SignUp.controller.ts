import { BackendMethod, Controller, Field, Validators, ControllerBase } from "remult";
import { User } from "./User.entity";
import '../Utils/AugmentRemult';
import { UITools } from "../Utils/AugmentRemult";

@Controller("signUp")
export class SignUp extends ControllerBase {

    @Field({
        validate: Validators.required,
        caption: 'שם'
    })
    name: string = '';

    @Field({
        validate: Validators.required,
        inputType: 'password', caption: 'סיסמה'
    })
    password: string = '';

    @Field<SignUp>({
        validate: self => {
            if (self.password !== self.confirmPassword)
                self.$.confirmPassword.error = "Doesn't match " + self.$.password.metadata.caption
        },
        caption: 'אישור סיסמה',
        inputType: 'password'
    })
    confirmPassword: string = '';

    show(ui: UITools) {
        ui.formDialog({
            title: "הרשמה",
            fields: [...this.$],
            ok: async () => {
                ui.setAuthToken(await this.register());
            }
        });
    }
    @BackendMethod({ allowed: true })
    async register() {
        let admin = false;
        if ((await this.remult.repo(User).count()) === 0)
            admin = true;// If it's the first user, make it an admin

        let user = this.remult.repo(User).create({
            name: this.name,
            admin
        });
        user.hashAndSetPassword(this.password);
        await user.save();
        return user.getJwtToken();

    }

}

