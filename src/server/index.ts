import express from 'express';
import expressJwt from 'express-jwt';
import { remultExpress } from 'remult/remult-express';
import { getJwtTokenSignKey } from '../Users/User.entity';
import '../Utils/AugmentRemult';
import glob from 'glob';
import path from 'path';

for (const type of ["entity", "controller"]) {
    for (const ext of ["js", "ts"]) {
        for (const file of glob.sync(`src/**/*.${type}.${ext}`)) {
            require(path.resolve(file))
        }
    }
}


const app = express();
app.use(expressJwt({
    secret: getJwtTokenSignKey(),
    credentialsRequired: false,
    algorithms: ['HS256']
}));

app.use(remultExpress());
app.listen(3002, () => console.log("Server started"));