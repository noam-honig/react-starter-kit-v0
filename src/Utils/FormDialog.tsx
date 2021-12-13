
import { Box, Button, Checkbox, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FieldRef } from 'remult';
import { auth } from '../common';
import { FormDialogArgs, UITools } from './AugmentRemult';
import { openDialog } from './StackUtils';
import { useTheme } from '@mui/material/styles';
import { typography } from '@mui/system';






export function FieldsInput(args: { fields: FieldRef[] }) {
    return (

        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 1,
            pb: 1
        }}>
            {args.fields.map(f => (<MyTextField key={f.metadata.key} field={f} />))}
        </Box >




    );
}

function MyTextField({ field }: { field: FieldRef }) {
    useField(field);
    const theme = useTheme();
    const [value, setValue] = useState(field.value);


    if (field.metadata.inputType === "checkbox") {
        return <Box sx={{
            color: field.error ? theme.palette.error.main : undefined
        }}>
            <FormControlLabel control={
                <Checkbox

                    size="small"
                    checked={value}
                    onChange={e => {
                        setValue(field.value = e.target.checked);
                    }}
                />} label={field.metadata.caption} />
            <Typography fontSize={"small"}>{field.error}</Typography>
        </Box>
    }
    return (

        <TextField
            type={field.metadata.inputType}
            size="small"
            value={value}
            label={field.metadata.caption}
            helperText={field.error}
            error={!!field.error}
            onChange={e => {
                setValue(field.value = e.target.value);
            }} />


    )
}
let i = 0;
export function useField<T>(field: FieldRef<T>) {
    const [, set] = useState({});
    useEffect(() =>
        field.subscribe(() => {
            set({});
        }), [field]);
    return field;
}

export async function formDialog({ fields, title, ok, cancel }: FormDialogArgs) {

    return await openDialog(
        close => {

            const handleOk = async () => {
                try {
                    await ok();
                    close();
                } catch (err: any) {
                    error(err);
                }
            }

            return (
                <>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        <FieldsInput fields={fields} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            if (cancel)
                                cancel();
                            close();
                        }}>Cancel</Button>
                        <Button onClick={handleOk}>ok</Button>
                    </DialogActions>
                </>
            )
        });
}

export async function error(error: any) {
    console.error(error);
    let message = error;
    if (error.message)
        message = error.message;

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


export const uiTools: UITools = {
    question,
    error,
    formDialog,
    setAuthToken: x => auth.setAuthToken(x)
}
