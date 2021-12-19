import { useCallback, useEffect, useState } from "react";

export function useEntityQuery<T>(get: () => Promise<T> | undefined, deps: any[]) {
    const [data, setData] = useState<T>();
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        setLoading(true); try {
            const tasks = await get();

            setData(tasks);
        } finally {
            setLoading(false);
        }
    }, deps);
    useEffect(() => { reload() }, [reload]);
    return { data, reload, loading, setData };
}
export function useEntityArray<T>(get: () => Promise<T[]> | undefined, deps: any[]) {
    let r = useEntityQuery(get, deps);
    return { ...r, add: (item: T) => r.setData(d => [...d!, item]) };
}