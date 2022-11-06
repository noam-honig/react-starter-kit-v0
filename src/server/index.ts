import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import expressJwt from 'express-jwt';
import sslRedirect from 'heroku-ssl-redirect'
import { createPostgresConnection, PostgresClient, PostgresDataProvider, PostgresPool } from 'remult/postgres';
import { remultExpress } from 'remult/remult-express';
import { getJwtTokenSignKey, TeacherRate } from '../Users/User.entity';
import '../Utils/AugmentRemult';
import glob from 'glob';
import path from 'path';
import { VersionInfo, versionUpdate } from './versionUpdates';
import { Groups } from '@mui/icons-material';
import { Group } from '../Courses/Group.entity';

import { Pool, QueryResult } from 'pg';
import { SqlDatabase } from 'remult';

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

export class PostgresSchemaWrapper implements PostgresPool {
    constructor(private pool: Pool, private schema: string) {

    }
    async connect(): Promise<PostgresClient> {
        let r = await this.pool.connect();

        await r.query('set search_path to ' + this.schema);
        return r;
    }
    async query(queryText: string, values?: any[]): Promise<QueryResult> {
        let c = await this.connect();
        try {
            return await c.query(queryText, values);
        }
        finally {
            c.release();
        }

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
    if (process.env['NODE_ENV'] === "production") {
        const pool = new Pool({
            connectionString: process.env['DATABASE_URL'],
            ssl: {
                rejectUnauthorized: false
            }
        });
        return new SqlDatabase(new PostgresDataProvider(new PostgresSchemaWrapper(pool, 'lev')));
    }
    return undefined;
}
app.use(remultExpress({
    dataProvider,
    initApi: async remult => {
        await versionUpdate(remult);
    }
}));
app.use(express.static('build'));
app.use('/*', async (req, res) => {
    res.sendFile(process.cwd() + '/build/index.html');
});
app.listen(process.env.PORT || 3002, () => console.log("Server started"));
