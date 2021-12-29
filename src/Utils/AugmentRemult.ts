import { FunctionComponent } from "react";
import { FieldRef } from "remult";

declare module 'remult' {
    export interface Remult {
        //ui: UITools;
    }
    export interface FieldOptions<entityType, valueType> {
        userClickToSelectValue?: (ref: FieldRef<entityType, valueType>) => void;
    }

}
export interface UITools {
    formDialog(args: FormDialogArgs): Promise<void>;
    error(message: any): Promise<void>;
    question(question: string): Promise<boolean>;
    setAuthToken(token: string): void;
    navigate(element: FunctionComponent, ...args: any[]): void;
}
export interface FormDialogArgs {
    title: string;
    fields: FieldRef<any>[];
    ok: () => Promise<any>;
    cancel?: () => Promise<void>
}
export interface Action<itemType = never> {
    caption: string,
    click: (item: itemType) => Promise<any> | any,
    icon?: FunctionComponent
}
export const DividerAction: Action<any> = {
    caption: '',
    click: undefined!
};