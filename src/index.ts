import 'module-alias/register';
import 'dotenv/config';
import { App } from './app';
import {
    UserController,
    AuthController,
    PostController,
    SubscribeController,
    BusinessController,
    FileController,
    CouponController,
    ChatController,
    DiscountController
} from './controllers';

const IS_DEV_MODE = process.env.NODE_ENV === 'dev';

const app = new App(
    Number(process.env.PORT),
    [
        new UserController(),
        new AuthController(),
        new PostController(),
        new SubscribeController(),
        new BusinessController(),
        new FileController(),
        new CouponController(),
        new ChatController(),
        new DiscountController()
    ],
    (IS_DEV_MODE
        ? process.env.DB_CONN_STRING_DEV
        : process.env.DB_CONN_STRING) as string
);

app.listen();
