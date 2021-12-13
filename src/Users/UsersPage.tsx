import { Button, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridRowParams, GridToolbarContainer } from "@mui/x-data-grid";
import { useMemo } from "react";
import { remult } from "../common";
import { uiTools } from "../Utils/FormDialog";
import { useMuiGrid, DeleteRowAction, AddRowAction, MyGrid } from "../Utils/useMuiGrid";
import { User } from "./User";





export function UsersPage() {
    return MyGrid(remult.repo(User), {
        editOnClick: true,
        gridActions: [AddRowAction],
        rowActions: [DeleteRowAction],
        fields: u => [u.name, u.admin],
    });
}

