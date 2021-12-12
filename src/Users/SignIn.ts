import { BackendMethod, Controller, ControllerBase, Field, Validators } from "remult";
import { UITools } from "../Utils/AugmentRemult";
import { User } from "./User";

@Controller("signIn")
export class SignIn extends ControllerBase {

    @Field({
        validate: Validators.required
    })
    name: string = '';

    @Field({
        validate: Validators.required,
        inputType: 'password'
    })
    password: string = '';

    show(ui: UITools) {
        ui.formDialog({
            title: "Sign In",
            fields: [...this.$],
            ok: async () => {
                ui.setAuthToken(await this.signIn());
            }
        });
    }
    @BackendMethod({ allowed: true })
    async signIn() {
        const user = await this.remult.repo(User).findFirst({
            name: this.name
        })
        if (!user || !user.passwordMatches(this.password))
            throw new Error("Invalid user or password");
        return user.getJwtToken();
    }
}