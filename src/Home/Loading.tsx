import { CircularProgress, Stack } from "@mui/material";




export function Loading(loading: boolean | LoadingItem | (boolean | LoadingItem)[], whatToReturn: JSX.Element) {
    let isLoading = false;
    if (Array.isArray(loading)) {
        for (const item of loading) {
            isLoading = loading.filter(checkLoading).length > 0;
        }
    }
    else
        isLoading = checkLoading(loading);
    if (isLoading)
        return (
            <Stack alignItems="center" spacing={2}>
                <CircularProgress color="primary" />
            </Stack>);
    return whatToReturn;


}


 export interface LoadingItem {
    loading: boolean
}

 function checkLoading(item: boolean | LoadingItem) {
    if (typeof item === "boolean") {
        if (item)
            return true;
    }
    else if (item.loading) {
        return true;
    }
    return false;
}