import 'dotenv/config';
import { App } from './app';
import { UserController } from './controllers/User';
import { AuthController } from './controllers/Auth.controller';

const IS_DEV_MODE = true;

const app = new App(
  Number(process.env.PORT),
  [new UserController(), new AuthController()],
  (IS_DEV_MODE
    ? process.env.DB_CONN_STRING_DEV
    : process.env.DB_CONN_STRING) as string
);

app.listen();
