
import { Backdrop, Box, Button, Checkbox, CircularProgress, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FieldRef, ValueListItem } from 'remult';

import { FormDialogArgs, FormField, UITools } from './AugmentRemult';
import { openDialog } from './StackUtils';
import { useTheme } from '@mui/material/styles';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ValueListValueConverter } from 'remult/valueConverters';
import { SelectDialog } from './SelectDialog';




export function getFormField(f: FieldRef | FormField): FormField {
    const z = f as FieldRef;
    if (z.metadata)
        return {
            field: z,
            caption: z.metadata.caption
        }
    else
        return f as FormField
}


export function FieldsInput(args: { fields: (FieldRef<any> | FormField)[] }) {
    return (

        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 1,
            pb: 1
        }}>
            {args.fields.map((item, index) => {
                const f = getFormField(item);
                return (<MyTextField key={index} formField={f} />);
            })}
        </Box >




    );
}

function MyTextField({ formField }: { formField: FormField }) {
    const field = formField.field;
    useField(field);
    const theme = useTheme();
    const [value, setValue] = useState(field.inputValue);
    const caption = formField.caption!;
    let inputType = field.metadata.inputType;
    let click = field.metadata.options.userClickToSelectValue;
    let options = formField.options;
    if (!options && field.metadata.valueConverter instanceof ValueListValueConverter) {
        options = field.metadata.valueConverter.getOptions();
    }
    if (options) {
        inputType = 'custom';
        click = ref => {
            SelectDialog({
                title: 'בחר ' + caption,
                find: async search => options!.filter(x => x.caption.indexOf(search) >= 0),
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
                />} label={caption} />
            <Typography fontSize={"small"}>{field.error}</Typography>
        </Box>
    }
    if (inputType === "custom") {
        return <FormControl variant="outlined" size="small" error={!!field.error}>
            <InputLabel htmlFor="custom-input">{caption}</InputLabel>
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
                label={caption}
            />
        </FormControl>
    }
    if (inputType === 'area')
        return (

            <TextField
                multiline={true}
                size="small"
                value={value}
                label={caption}
                helperText={field.error}
                error={!!field.error}
                onChange={e => {
                    setValue(field.value = e.target.value);
                }} />


        )
    return (

        <TextField
            type={inputType}
            size="small"
            value={value}
            label={caption}
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
