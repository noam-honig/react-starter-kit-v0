import { FieldRef } from "remult";

declare module 'remult' {
    export interface Remult {
        ui: UITools;
    }
}
export interface UITools {
    formDialog(args: FormDialogArgs): Promise<void>;
    error(message: string): Promise<void>;
    question(question: string): Promise<boolean>;
}
export interface FormDialogArgs {
    title: string;
    fields: FieldRef<any>[];
    ok: () => Promise<void>;
    cancel?: () => Promise<void>
}