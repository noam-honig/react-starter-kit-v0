import { GridColDef, GridFeatureMode, GridFilterModel, GridSortModel } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { Repository, EntityFilter, IdEntity, ContainsStringValueFilter, EntityBase, ValueFilter,Paginator } from "remult";

export function useMuiGrid<entityType>(repo: Repository<entityType>) {
    const [sortModel, onSortModelChange] = useState([] as GridSortModel);
    const [filterModel, onFilterModelChange] = useState({
        items: []
    } as GridFilterModel);
    const [s, set] = useState({
        allRows: [] as entityType[],
        rows: [] as entityType[],
        pager: undefined! as Paginator<entityType>,
        rowCount: 0,
        pageSize: 100,
        loadedPage: 0,
        page: 0,
        loading: false
    });
    const { fields, columns } = useMemo(() => {
        let item = repo.create();
        let fields: any = {};
        let columns = [] as GridColDef[];
        for (const f of [...repo.metadata.fields]) {
            let field: GridColDef = {
                field: f.key,
                headerName: f.caption,
                width:150
            }
            if (f.options.valueType === Boolean)
                field.type = "boolean";
            else if (f.valueType === undefined && typeof repo.getEntityRef(item).fields.find(f).value == "boolean") {
                field.type = "boolean";
            }
            if (!(item instanceof IdEntity && f.key === "id")) {
                columns.push(field);
            }

            fields[f.key] = field;
        }
        return { fields: fields as GridColFields<entityType>, columns }
    }, []);
    useEffect(() => {
        set({ ...s, loading: true });
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
        let state = s;
        (async () => {
            state.pager = await repo.query({
                pageSize: state.pageSize,
                orderBy,
                where: (where.length == 0 || !filterModel ? undefined :
                    filterModel.linkOperator == "or" ? { $or: where } : { $and: where }) as EntityFilter<entityType>
            }).paginator();

            state.rowCount = await state.pager.count();
            state.loadedPage = 0;
            state.page = 0;
            state.loading = false;
            state.allRows = state.pager.items;
            state.rows = state.pager.items;
            set(state);
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
            state.rows = state.allRows.filter((_, i) => i >= page * state.pageSize && i <= (page + 1) * state.pageSize);
            set(state);
        }
    }
}
export declare type OmitEB<T> = Omit<T, keyof EntityBase>;
export declare type GridColFields<entityType> = {

    [Properties in keyof OmitEB<entityType>]: GridColDef;

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