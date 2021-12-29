import { Button, Dialog, IconButton, Slide, Snackbar } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import { forwardRef, ReactNode, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';


class Application {
    dialogs: ReactNode[] = [];
    snackText?: string;
    closeSnack() {
        this.snackText = '';
    }
    constructor() {
        makeAutoObservable(this);
    }
}
export const StackUtilsComponent = observer(({ children }) => {
    const y = [...app.dialogs];
    const action = (
        <React.Fragment>

            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => app.closeSnack()}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment >
    );

    return <>
        {children}
        {y}
        <Snackbar
            open={!!app.snackText}
            autoHideDuration={3000}
            onClick={() => app.closeSnack()}
            onClose={() => app.closeSnack()}
            message={app.snackText}
            action={action}
        />

    </>
})

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const MyDialog: React.FC<{ children?: React.ReactNode }> = observer(({ children }) => {
    const [open] = useState(true);
    return (<Dialog
        open={open}
        TransitionComponent={Transition}
    >
        {children}
    </Dialog>)
})
const app = new Application();
export function openDialog(whatToShow: (callMeToClose: (() => void)) => ReactNode): Promise<void> {

    return new Promise((res) => {
        const close = () => {
            app.dialogs.pop();
            res();
        };
        app.dialogs.push(<MyDialog key={app.dialogs.length} >{whatToShow(close)}
        </MyDialog>);
    })

}

export function showInfo(what: string) {
    app.snackText = what;
}
