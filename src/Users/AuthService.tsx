import jwtDecode from 'jwt-decode';
import { BackendMethod, Remult } from 'remult';
import { User } from './User.entity';

export class AuthService {
   
    setAuthToken(token: string) {
        this.remult.setUser(jwtDecode(token));
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    signOut() {
        this.remult.setUser(undefined!);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }

    static fromStorage(): string {
        return sessionStorage.getItem(AUTH_TOKEN_KEY)!;
    }

    constructor(private remult: Remult) {
        const token = AuthService.fromStorage();
        if (token) {
            this.setAuthToken(token);
        }
    }
}

const AUTH_TOKEN_KEY = "authToken";
