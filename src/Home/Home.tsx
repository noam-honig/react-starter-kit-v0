import { Typography } from "@mui/material";
import { useMemo } from "react";
import { remult } from "../common";
import { SignUp } from "../Users/SignUp";
import { FieldsInput } from "../Utils/FormDialog";

export function Home() {
    const signUp = useMemo(() => new SignUp(remult), [])
    return (<>
        <Typography variant="h4">Hello World</Typography>
        <FieldsInput fields={[...signUp.$]} ></FieldsInput>
    </>)
}