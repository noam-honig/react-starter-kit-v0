import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "./Users/AuthService";
import { Remult } from "remult";


export const RemultContext = createContext<Remult>(undefined!);
export const AuthContext = createContext<AuthService>(undefined!);
export function useRemult() {
    const remult = useContext(RemultContext);
    const [, refresh] = useState({});
    useEffect(() => {
        let unobserve = () => { };
        remult.userChange.observe(() => refresh({})).then(x => unobserve = x);
        return () => {
            unobserve();
        }
    }, []);
    return remult;
}