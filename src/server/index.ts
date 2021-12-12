import express from 'express';
import expressJwt from 'express-jwt';
import { remultExpress } from 'remult/remult-express';
import { getJwtTokenSignKey } from '../Users/User';
import '../Users/SignUp';
import '../Users/SignIn';

const app = express();
app.use(expressJwt({
    secret: getJwtTokenSignKey(),
    credentialsRequired: false,
    algorithms: ['HS256']
}));

app.use(remultExpress());
app.listen(3002, () => console.log("Server started"));