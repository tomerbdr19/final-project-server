import 'dotenv/config';
import { App } from './app';
import {
    UserController,
    AuthController,
    PostController,
    SubscribeController,
    BusinessController
} from './controllers';

const IS_DEV_MODE = true;

const app = new App(
    Number(process.env.PORT),
    [
        new UserController(),
        new AuthController(),
        new PostController(),
        new SubscribeController(),
        new BusinessController()
    ],
    (IS_DEV_MODE
        ? process.env.DB_CONN_STRING_DEV
        : process.env.DB_CONN_STRING) as string
);

app.listen();
