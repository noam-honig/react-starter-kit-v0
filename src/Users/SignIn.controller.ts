import { BackendMethod, Controller, ControllerBase, Field, Remult, Validators } from "remult";
import { UITools } from "../Utils/AugmentRemult";
import { User } from "./User.entity";

@Controller("signIn")
export class SignIn extends ControllerBase {

    @Field({
        validate: Validators.required.withMessage("חסר"),
        caption: "שם"
    })
    name: string = '';

    @Field({
        validate: Validators.required.withMessage("חסר"),
        inputType: 'password',
        caption: "סיסמה"
    })
    password: string = '';

    show(ui: UITools) {
        ui.formDialog({
            title: "כניסה",
            fields: [...this.$],
            ok: async () => {
                await new Promise(res => {
                    setTimeout(() => {
                        res({});
                    }, 1000);
                })
                ui.setAuthToken(await this.signIn());
            }
        });
    }
    @BackendMethod({ allowed: true })
    async signIn() {
        const user = await this.remult.repo(User).findFirst({
            name: this.name
        })
        if (!user)
            throw new Error("משתמש לא נמצא");
        if (user.password && !user.passwordMatches(this.password))
            throw new Error("סיסמה שגויה");
        if (!user.password) {
            user.password = this.password;
            await user.save();
        }
        return user.getJwtToken();
    }

    @BackendMethod({ allowed: true })
    static async validateUserToken(userToken: string, remult?: Remult) {
        let user = await remult!.repo(User).findId(userToken);
        if (user && !user.admin && !user.removed) {
            return {
                token: user.getJwtToken()
            }
        }
        return { ok: false };
    }
}