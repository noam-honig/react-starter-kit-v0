import { createContext } from "react";
import { AuthService } from "./Users/AuthService";
import { Remult } from "remult";


export const RemultContext = createContext<Remult>(undefined!);
export const AuthContext = createContext<AuthService>(undefined!);