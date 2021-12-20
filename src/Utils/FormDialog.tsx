
import { Backdrop, Box, Button, Checkbox, CircularProgress, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FieldRef, ValueListItem } from 'remult';

import { FormDialogArgs, UITools } from './AugmentRemult';
import { openDialog } from './StackUtils';
import { useTheme } from '@mui/material/styles';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ValueListValueConverter } from 'remult/valueConverters';
import { SelectDialog } from './SelectDialog';






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
    const [value, setValue] = useState(field.inputValue);
    let inputType = field.metadata.inputType;
    let click = field.metadata.options.userClickToSelectValue;
    if (field.metadata.valueConverter instanceof ValueListValueConverter) {
        inputType = 'custom';
        let con = field.metadata.valueConverter;
        click = ref => {
            let options: ValueListItem[] = con.getOptions();
            SelectDialog({
                title: 'בחר ' + field.metadata.caption,
                find: async search => options.filter(x => x.caption.indexOf(search) >= 0),
                select: x => ref.value = x
            });
        }
    }


    if (inputType === "checkbox") {
        return <Box sx={{
            color: field.error ? theme.palette.error.main : undefined
        }}>
            <FormControlLabel control={
                <Checkbox

                    size="small"
                    checked={field.value}
                    onChange={e => {
                        field.value = e.target.checked;
                    }}
                />} label={field.metadata.caption} />
            <Typography fontSize={"small"}>{field.error}</Typography>
        </Box>
    }
    if (inputType === "custom") {
        return <FormControl variant="outlined" size="small" error={!!field.error}>
            <InputLabel htmlFor="custom-input">{field.metadata.caption}</InputLabel>
            <OutlinedInput readOnly
                id="custom-input"
                value={field.displayValue}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => {
                                click!(field);
                            }}
                            edge="end"
                        >
                            <ArrowDropDownIcon />
                        </IconButton>
                    </InputAdornment>
                }
                label={field.metadata.caption}
            />
        </FormControl>
    }
    return (

        <TextField
            type={inputType}
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
            const Me = () => {
                const [backdrop, setBackdrop] = useState(false);
                const handleOk = async () => {
                    try {
                        setBackdrop(true);
                        await ok();
                        setBackdrop(false);
                        close();
                    } catch (err: any) {
                        setBackdrop(false);
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
                            }}>בטל</Button>
                            <Button onClick={handleOk}>אשר</Button>
                        </DialogActions>
                        <Backdrop
                            sx={{ color: '#fff', position: 'absolute', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={backdrop}
                        >
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    </>
                )
            }
            return (<Me />);
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
                    <Button onClick={close}>לא</Button>
                    <Button onClick={() => {
                        yes = true;
                        close();
                    }}>כן</Button>
                </DialogActions>
            </>)
    });
    return yes;
}


export const uiTools: UITools = {
    question,
    error,
    formDialog,
    navigate: undefined!,
    setAuthToken: undefined!
}
