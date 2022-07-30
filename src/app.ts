import express, { Application } from 'express';
import cors from 'cors';
import { IController } from './types/Controller';
import { connect } from 'mongoose';
import passport from './passport/passport';
export class App {
    public express: Application;
    public port: number;

    constructor(port: number, controllers: IController[], mongoUrl: string) {
        this.express = express();
        this.port = port;

        // this.initMiddleware();
        this.express.use(express.json());
        this.express.use(cors());
        this.express.use(passport.initialize());
        this.initDB(mongoUrl);
        this.initControllers(controllers);
    }

    initControllers(controllers: IController[]) {
        controllers.forEach((_) => {
            this.express.use('/api', _.router);
        });
    }

    private initMiddleware() {
        throw new Error('Method not implemented.');
    }

    private async initDB(mongoUrl: string) {
        await connect(mongoUrl);
    }

    public listen() {
        this.express.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        });
    }
}
