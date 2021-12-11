import { BackendMethod, Controller, Field, Remult, Validators, ControllerBase } from "remult";




@Controller("signUp")
export class SignUp extends ControllerBase {

    @Field({
        validate: Validators.required
    })

    name: string = '';
    @Field({
        validate: Validators.required,
        inputType: 'password'
    })
    password: string = '';
    @Field<SignUp>({
        validate: self => {
            if (self.password != self.confirmPassword)
                self.$.confirmPassword.error = "Doesn't match " + self.$.password.metadata.caption
        },
        inputType: 'password'
    })
    confirmPassword: string = '';
    show() {
        this.remult.ui.formDialog({
            title: "Sign Up",
            fields: [...this.$],
            ok: async () => {
                await this.register();
            }
        });
    }
    @BackendMethod({ allowed: true })
    async register() {

    }

}

