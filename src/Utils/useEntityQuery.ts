import { useCallback, useEffect, useMemo, useState } from "react";

export function useEntityQuery<T>(get: () => Promise<T> | undefined, deps: any[]) {
    const [data, setData] = useState<T>();
    const [loading, setLoading] = useState(true);
    const context = useMemo(() => ({ queryNumber: 0 }), []);

    const reload = useCallback(async () => {
        const q = ++context.queryNumber;
        setLoading(true); try {
            const tasks = await get();
            if (q == context.queryNumber)
                setData(tasks);
        } finally {
            if (q == context.queryNumber)
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


export function useRender() {
    const [, render] = useState({});
    return () => render({});
}