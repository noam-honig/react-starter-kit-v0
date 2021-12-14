import axios from "axios";
import './Utils/AugmentRemult';
import { Remult } from "remult";

import { AuthService } from "./Users/AuthService";
axios.interceptors.request.use(config => {
    const token = AuthService.fromStorage();
    if (token)
        config.headers!["Authorization"] = "Bearer " + token;
    return config;
});
Remult.apiBaseUrl='/api';
export const remult = new Remult(axios);
export const auth = new AuthService(remult);

