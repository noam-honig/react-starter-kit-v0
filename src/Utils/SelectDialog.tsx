import { Button, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, TextField } from "@mui/material";
import { useContext, useMemo, useState } from "react";
import { EntityFilter, EntityMetadata, FieldMetadata, Fields, FieldsMetadata, getEntityRef, Repository } from "remult";
import { RemultContext } from "../common";
import { openDialog } from "./StackUtils";
import { useEntityQuery } from "./useEntityQuery";
import CloseIcon from '@mui/icons-material/Close';
import { Action } from "./AugmentRemult";
import { ClassType } from "remult/classType";

export interface SelectDialogActionArgs<T> {
    select: (item: T) => void;
    searchValue: string;
    repo: Repository<T>;
}
export interface SelectDialogArgs<T> {
    select: (item: T) => void;
    searchColumn?: (itemFields: FieldsMetadata<T>) => FieldMetadata;
    title?: string;
    actions?: Action<SelectDialogActionArgs<T>>[]
}
export function SelectDialog<T>(itemType: ClassType<T>, props: SelectDialogArgs<T>) {


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
            const [search, setSearch] = useState('');
            const { data } = useEntityQuery(async () => repo.find({
                where: {
                    [searchKey]: { $contains: search }
                } as EntityFilter<T>,
                limit: 100
            }), [search]);
            const select = (s: T) => {
                props.select(s);
                close();
            }
            return (
                <>
                    <DialogTitle sx={{ m: 0, p: 2 }} >
                        <TextField size="small" label={title} value={search} onChange={e => setSearch(e.target.value)} autoFocus />
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
                    <DialogContent>
                        <List sx={{ pt: 0 }}>
                            {data?.map((s) => (
                                <ListItem button onClick={() => select(s)} key={getEntityRef(s).getId()}>

                                    <ListItemText primary={getEntityRef(s).fields.find(searchKey).displayValue as string} />
                                </ListItem>
                            ))}
                        </List>


                    </DialogContent>
                    {props.actions && (<DialogActions >
                        {props.actions.map(action => (
                            <Button
                                key={action.caption}
                                onClick={() => {
                                    action.click({
                                        searchValue: search,
                                        select,
                                        repo
                                    });
                                }}>{action.caption}</Button>
                        ))}


                    </DialogActions>)}




                </>)
        }
        return (<SelectStudentElement />);
    });
}

