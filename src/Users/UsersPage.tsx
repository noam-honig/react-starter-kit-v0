import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMemo } from "react";
import { remult } from "../common";
import { useMuiGrid } from "../Utils/useMuiGrid";
import { User } from "./User";

export function UsersPage() {
    const mui = useMuiGrid(remult.repo(User));
    const columns = useMemo(() => [mui.fields.name, mui.fields.admin], []);
    return (<div style={{ height: 500, width: '100%' }}>
        {<DataGrid  {...mui} columns={columns} disableSelectionOnClick onRowClick={x=>{
            console.log(x);
        }} />}
    </div>)
}