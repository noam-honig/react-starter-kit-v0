import { Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { createContext, forwardRef, ReactNode, useState } from "react"

const UIToolsContext = createContext<{
    openDialog(whatToShow: (callMeToClose: (() => void)) => ReactNode): Promise<void>
}>(undefined!)

export const UIToolsComponent: React.FC<{}> = ({ children }) => {
    const [dialogs, setDialogs] = useState<ReactNode[]>([]);
    return <UIToolsContext.Provider value={{
        openDialog: (whatToShow) => {
            return new Promise((res) => {
                const close = () => {
                    setDialogs([...dialogs.splice(dialogs.length - 1)])
                    res();
                };
                setDialogs([...dialogs, (<MyDialog key={dialogs.length} >{whatToShow(close)}
                </MyDialog>)]);
            })
        }
    }}>
        {children}
    </UIToolsContext.Provider>
}


const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const MyDialog: React.FC<{ children?: React.ReactNode }> = (({ children }) => {
    const [open] = useState(true);
    return (<Dialog
        open={open}
        TransitionComponent={Transition}
    >
        {children}
    </Dialog>)
})