
import { Box, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, TextField } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, useEffect, useState } from 'react';
import { ErrorInfo, FieldRef } from 'remult';
import { FormDialogArgs, UITools } from './AugmentRemult';
import { openDialog } from './StackUtils';



export function FieldsInput(args: { fields: FieldRef[] }) {
    return (

        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            pt: 1,
            pb: 1
        }}>
            {args.fields.map(f => (<MyTextField key={f.metadata.key} field={f} />))}
        </Box >




    );
}

function MyTextField({ field }: { field: FieldRef }) {
    useField(field);
    const [value, setValue] = useState(field.value);
    return (

        <TextField
            type={field.metadata.inputType}
            size='small'
            value={value}
            label={field.metadata.caption}
            helperText={field.error}
            error={!!field.error}
            onChange={e => {
                setValue(field.value = e.target.value);
            }} />


    )
}
export function useField<T>(field: FieldRef<T>) {
    const [x, set] = useState({});
    useEffect(() => field.subscribe(() => set({})), [field]);
    return field;
}

export async function formDialog({ fields, title, ok }: FormDialogArgs) {

    return await openDialog(
        close => {

            const handleOk = async () => {
                try {
                    await ok();
                    close();
                } catch (err: any) {
                    error(err?.message);
                }
            }

            return (
                <>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            pt: 1
                        }}>
                            {fields.map(f => (<MyTextField key={f.metadata.key} field={f} />))}
                        </Box >
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={close}>Cancel</Button>
                        <Button onClick={handleOk}>ok</Button>
                    </DialogActions>
                </>
            )
        });
}

export async function error(message: string) {
    return await openDialog(close => {
        return (
            <>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>ok</Button>
                </DialogActions>
            </>)
    });
}
export async function question(message: string) {
    let yes = false;
    await openDialog(close => {

        return (
            <>
                <DialogTitle>Question</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>No</Button>
                    <Button onClick={() => {
                        yes = true;
                        close();
                    }}>Yes</Button>
                </DialogActions>
            </>)
    });
    return yes;
}


export const dialogs: UITools = {
    question,
    error,
    formDialog
}
