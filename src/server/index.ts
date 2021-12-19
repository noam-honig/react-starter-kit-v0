import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import expressJwt from 'express-jwt';
import sslRedirect from 'heroku-ssl-redirect'
import { createPostgresConnection } from 'remult/postgres';
import { remultExpress } from 'remult/remult-express';
import { getJwtTokenSignKey } from '../Users/User.entity';
import '../Utils/AugmentRemult';
import glob from 'glob';
import path from 'path';

let ext = "ts";
let dir = "src";
if (__filename.endsWith("js")) {
    ext = "js";
    dir = "dist";
}

for (const type of ["entity", "controller"]) {
    for (const file of glob.sync(dir + `/**/*.${type}.${ext}`)) {
        require(path.resolve(file))
    }
}


const app = express();
app.use(sslRedirect());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(expressJwt({
    secret: getJwtTokenSignKey(),
    credentialsRequired: false,
    algorithms: ['HS256']
}));
const dataProvider = async () => {
    if (process.env.NODE_ENV === "production")
        return createPostgresConnection({ configuration: "heroku" })
    return undefined;
}
app.use(remultExpress({
    dataProvider
}));
app.use(express.static('build'));
app.use('/*', async (req, res) => {
    res.sendFile('./build/index.html');
});
app.listen(process.env.PORT || 3002, () => console.log("Server started"));