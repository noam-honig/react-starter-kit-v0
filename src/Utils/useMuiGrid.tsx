import { DataGrid, GridActionsCellItem, GridColDef, GridFeatureMode, GridFilterModel, GridRowParams, GridSlotsComponent, GridSortModel, GridToolbarContainer } from "@mui/x-data-grid";
import React, { useEffect, useMemo, useState } from "react";
import { Repository, EntityFilter, IdEntity, ContainsStringValueFilter, EntityBase, ValueFilter, Paginator, FieldMetadata, getEntityRef, FieldsMetadata, FieldRef } from "remult";
import { Action } from "./AugmentRemult";
import { uiTools } from "./FormDialog";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Button } from "@mui/material";

declare type GridRowAction<entityType> = Action<{ row: entityType, utils: GridUtils<entityType> }>;

export interface muiGridOptions<entityType> {
    fields?: (entity: FieldsMetadata<entityType>) => FieldMetadata[],
    editOnClick?: boolean,
    singular?: string,
    rowActions?: GridRowAction<entityType>[],
    gridActions?: Action<GridUtils<entityType>>[]
}

const pageSize = 100;
export function useMuiGrid<entityType>(repo: Repository<entityType>, options?: muiGridOptions<entityType>) {

    const [sortModel, onSortModelChange] = useState([] as GridSortModel);
    const [filterModel, onFilterModelChange] = useState({
        items: []
    } as GridFilterModel);
    const [s, set] = useState({
        allRows: [] as entityType[],
        rows: [] as entityType[],
        pager: undefined! as Paginator<entityType>,
        rowCount: 0,

        loadedPage: 0,
        page: 0,
        loading: false
    });

    const { fields, columns, components, ...config } = useMemo(() => {

        let item = repo.create();
        let fields: any = {};

        const gridUtils: GridUtils<entityType> = {
            create: () => repo.create(),
            removeRow: row => set(s => ({ ...s, allRows: s.allRows.filter(x => x !== row), rows: s.rows.filter(x => x !== row) })),
            renderRows: () => set(s => ({ ...s, rows: [...s.rows] })),
            addRow: row => set(s => ({ ...s, allRows: [...s.allRows, row], rows: [...s.rows, row] })),
            displayFields: [] as FieldMetadata[]
        }

        let map = new Map<FieldMetadata, GridColDef>();
        for (const f of [...repo.metadata.fields]) {
            let field: GridColDef = {
                field: f.key,
                headerName: f.caption,
                width: 150,
                valueGetter:({row})=>{
                    return getEntityRef(row).fields.find(f).displayValue;
                }
            }
            if (f.options.valueType === Boolean)
                field.type = "boolean";
            else if (f.valueType === undefined && typeof repo.getEntityRef(item).fields.find(f).value == "boolean") {
                field.type = "boolean";
            }
            map.set(f, field);
            fields[f.key] = field;
        }
        if (options?.fields)
            gridUtils.displayFields = options?.fields(repo.metadata.fields);
        else
            gridUtils.displayFields = defaultEditFieldsMetaData(item);



        let columns = gridUtils.displayFields.map(f => map.get(f)!);
        if (options?.rowActions) {
            let actions: GridColDef = {
                type: 'actions',
                field: 'actions',
                width: 10,
                //@ts-ignore
                getActions: (params: GridRowParams<User>) => {
                    return options.rowActions!.map(a => (
                        <GridActionsCellItem key={a.caption} onClick={async () => {
                            await a.click({ row: params.row, utils: gridUtils });

                        }} label={a.caption} showInMenu icon={a.icon ? React.createElement(a.icon) : undefined} />
                    ))

                }
            }
            columns.push(actions);
        }
        let components: Partial<GridSlotsComponent> = undefined!;
        if (options?.gridActions) {
            components = {
                Toolbar: () => (
                    <GridToolbarContainer>
                        {options.gridActions?.map(a => (
                            <Button key={a.caption} startIcon={a.icon ? React.createElement(a.icon) : undefined}
                                size="small"
                                onClick={async () => {

                                    a.click(gridUtils);
                                }}
                            >
                                {a.caption}
                            </Button>
                        ))}
                    </GridToolbarContainer>
                )
            }
        }



        return { fields: fields as GridColFields<entityType>, components, columns, singular: options?.singular || repo.metadata.caption, gridUtils }
    }, []);
    useEffect(() => {
        set(s => ({ ...s, loading: true }));
        let orderBy: any = {};
        for (const sort of sortModel) {
            orderBy[sort.field] = sort.sort;
        }
        let where = [];
        if (filterModel?.items)
            for (const filter of filterModel?.items!) {
                let val = filter.value || '';
                switch (filter.operatorValue) {
                    case "contains":
                        val = {
                            $contains: val
                        } as ContainsStringValueFilter

                        break;
                    case "startsWith":
                    case "endsWith":
                        console.log(filter.operatorValue + " filter not yet supported, using contains instead");
                        val = {
                            $contains: val
                        } as ContainsStringValueFilter

                        break;
                    case "is": {
                        switch (filter.value) {
                            case "true":
                                val = true;
                                break;
                            case "false":
                                val = false;
                                break;
                            default:
                                val = undefined;
                                break;
                        }
                    }
                        break;
                    case "isEmpty":
                        val = "";
                        break;
                    case "isNotEmpty":
                        val = { $ne: "" } as ValueFilter<any>
                        break;
                    default:
                        break;
                }
                where.push({ [filter.columnField]: val });
            }

        (async () => {
            const pager = await repo.query({
                pageSize: pageSize,
                orderBy,
                where: (where.length === 0 || !filterModel ? undefined :
                    filterModel.linkOperator === "or" ? { $or: where } : { $and: where }) as EntityFilter<entityType>
            }).paginator();

            const rowCount = await pager.count();
            set(s => ({
                ...s, pager, rowCount, loadedPage: 0, page: 0, loading: false, allRows: pager.items,
                rows: pager.items
            }));
        })();
    }, [sortModel, filterModel]);

    const { rows, loading, rowCount, page } = s;
    return {
        rows,
        loading,
        rowCount,
        page,
        filterModel,
        paginationMode: "server" as GridFeatureMode,
        sortingMode: "server" as GridFeatureMode,
        filterMode: "server" as GridFeatureMode,
        sortModel,
        onSortModelChange,
        onFilterModelChange,
        fields,
        columns,

        onPageChange: async (page: number) => {
            let state = { ...s };
            if (page > state.loadedPage && state.pager?.hasNextPage) {
                set({ ...s, loading: true })
                state.pager = await state.pager?.nextPage();
                state.allRows = [...state.allRows, ...state.pager.items];
                state.loadedPage = page;
                state.loading = false;
            }
            state.page = page;
            state.rows = state.allRows.filter((_, i) => i >= page * pageSize && i <= (page + 1) * pageSize);
            set(state);
        },

        addRow: (row: entityType) => {
            set({ ...s, allRows: [...s.allRows, row], rows: [...s.rows, row] })
        },
        components,

        disableSelectionOnClick: true,
        onRowClick: options?.editOnClick ? (x: GridRowParams) => {
            let row = getEntityRef(x.row);
            uiTools.formDialog({
                title: 'ערוך ' + config.singular,
                fields: config.gridUtils.displayFields.map(f => row.fields.find(f)),
                ok: async () => {
                    await row.save();
                    config.gridUtils.renderRows();
                },
                cancel: () => row.undoChanges()
            });
        } : undefined
    }
}
export declare type OmitEB<T> = Omit<T, keyof EntityBase>;
export declare type GridColFields<entityType> = {

    [Properties in keyof OmitEB<entityType>]: GridColDef;

}
export interface GridUtils<entityType> {
    addRow: (row: entityType) => void;
    removeRow: (row: entityType) => void;
    renderRows: () => void;
    create(): entityType;
    displayFields: FieldMetadata[];
}


/*
yarn add @mui/material @mui/x-data-grid @emotion/react @emotion/styled


const mui = useMuiGrid(taskRepo);
  return (

    <div style={{ height: 500, width: '100%' }}>
      <DataGrid  {...mui} />
    </div>
  );
*/

export const DeleteRowAction: GridRowAction<any> = {
    caption: 'מחק',
    click: async ({ row, utils }) => {
        await getEntityRef(row).delete();
        utils.removeRow(row);
    },
    icon: DeleteIcon
};
export const AddRowAction: Action<GridUtils<any>> = {
    caption: 'הוסף',
    click: async (utils) => {
        let row = utils.create();
        let ref = getEntityRef(row);
        uiTools.formDialog({
            title: 'הוסף',
            fields: utils.displayFields.map(x => ref.fields.find(x)),
            ok: async () => {
                await ref.save();
                utils.addRow(row);
            },
            cancel: () => ref.undoChanges()
        });
    },
    icon: AddIcon
};



function defaultEditFieldsMetaData<entityType>(item: entityType) {
    let ref = getEntityRef(item);
    let result = [] as FieldMetadata<entityType>[];
    for (const f of [...ref.metadata.fields]) {
        if (!(item instanceof IdEntity && f.key === "id")) {
            result.push(f);
        }
    }
    return result;
}


export function defaultEditFields<entityType>(item: entityType) {
    let ref = getEntityRef(item);
    let result = [] as FieldRef<entityType>[];
    return defaultEditFieldsMetaData(item).map(f => ref.fields.find(f));
}

export function MyGrid<entityType>(repo: Repository<entityType>, options?: muiGridOptions<entityType>) {
    let mui = useMuiGrid(repo, options);
    return (
        <div style={{ height: 500, width: '100%' }}>
            <DataGrid density="compact" {...mui} />
        </div>

    )
}