import { Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";
import { forwardRef, ReactNode, useState } from "react";


class Application {
    dialogs: ReactNode[] = [];
    constructor() {
        makeAutoObservable(this);
    }
}
export const StackUtilsComponent = observer(({ children }) => {
    const y = [...app.dialogs];
    return <>
        {children}
        {y}

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

