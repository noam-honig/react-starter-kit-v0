import { Backdrop, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, TextField } from "@mui/material";
import { useContext, useMemo, useState } from "react";
import { EntityFilter, FieldMetadata, FieldsMetadata, getEntityRef } from "remult";
import { RemultContext } from "../common";
import { openDialog } from "./StackUtils";
import { useEntityQuery } from "./useEntityQuery";
import CloseIcon from '@mui/icons-material/Close';
import { Action } from "./AugmentRemult";
import { ClassType } from "remult/classType";

export interface SelectDialogActionArgs<T> {
    select: (item: T) => void;
    searchValue: string;

}
export interface SelectEntityDialogArgs<T> extends SelectDialogArgs<T> {

    searchColumn?: (itemFields: FieldsMetadata<T>) => FieldMetadata;
    title?: string;
    actions?: Action<SelectDialogActionArgs<T>>[]
}
export interface SelectDialogArgs<T> {
    select: (item: T) => void;
    actions?: Action<SelectDialogActionArgs<T>>[]
}

export function SelectDialog<T>(props: {
    title: string,
    find: (search: string) => Promise<T[]>,
    select: (what: T) => void,
    actions?: Action<SelectDialogActionArgs<T>>[],
    getCaption?: (t: T) => string,
    id?: (t: T) => string
}) {
    return openDialog(close => {
        const Select = buildSearchCore({
            close,
            find: props.find,
            id: props.id ? props.id : (x: any) => x.id,
            primary: props.getCaption ? props.getCaption : (x: any) => x.caption,
            select: props.select,
            title: props.title,
            actions: props.actions
        });
        return <Select />;
    })
}

export function SelectEntityDialog<T>(itemType: ClassType<T>, props: SelectEntityDialogArgs<T>) {
    return openDialog(close => {
        const SelectStudentElement = () => {
            const remult = useContext(RemultContext);
            const { repo, title, searchKey } = useMemo(() => {
                const repo = remult.repo(itemType);
                let title = props.title;
                let searchKey: string = '';;
                if (props.searchColumn) {
                    searchKey = props.searchColumn(repo.metadata.fields).key;
                }
                else for (const f of repo.metadata.fields) {
                    if (f.key != "id" && f.valueType != Number && f.valueType != String) {
                        searchKey = f.key;
                        break;
                    }
                }
                if (!title)
                    title = "בחירת " + repo.metadata.caption;
                return {
                    repo, title, searchKey
                }
            }, []);
            const SearchCore = buildSearchCore<T>({
                close,
                find: async search => repo.find({
                    where: {
                        [searchKey]: { $contains: search }
                    } as EntityFilter<T>,
                    limit: 100
                }),
                title,
                select: props.select,
                primary: s => getEntityRef(s).fields.find(searchKey).displayValue as string,
                id: s => getEntityRef(s).getId(),
                actions: props.actions
            });
            return <SearchCore />;
        }
        return (<SelectStudentElement />);
    });
}
function buildSearchCore<T>({ close, ...props }: {
    title: string,
    find: (search: string) => Promise<T[]>,
    select: (what: T) => void,
    actions?: Action<SelectDialogActionArgs<T>>[],
    primary: (t: T) => string,
    id: (t: T) => string,
    close: () => void
}) {
    return () => {
        const [search, setSearch] = useState('');
        const { data, loading } = useEntityQuery(async () => props.find(search), [search]);
        const select = (s: T) => {
            props.select(s);
            close();
        }
        return (
            <>
                <DialogTitle sx={{ m: 0, p: 2 }} >
                    <TextField size="small" label={props.title} value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                    <IconButton
                        aria-label="close"
                        onClick={close}
                        sx={{
                            //   position: 'absolute',
                            //  right: 8,
                            // top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                </DialogTitle>
                <DialogContent sx={{ position: 'relative' }}>

                    <List sx={{ pt: 0 }}>
                        {data?.map((s) => (
                            <ListItem button onClick={() => select(s)} key={props.id(s)}>

                                <ListItemText primary={props.primary(s)} />
                            </ListItem>
                        ))}
                    </List>
                    <Backdrop
                        sx={{ color: '#fff', position: 'absolute', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={loading}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>


                </DialogContent>
                {
                    props.actions && (<DialogActions >
                        {props.actions.map(action => (
                            <Button
                                key={action.caption}
                                onClick={() => {
                                    action.click({
                                        searchValue: search,
                                        select
                                    });
                                }}>{action.caption}</Button>
                        ))}


                    </DialogActions>)
                }
            </>)
    };
}


