import 'dotenv/config';
import { IController, ServerErrors } from '@types';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { multerUpload } from '@utils/multer';

export class FileController implements IController {
    path: string = '/file';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(
            `${this.path}`,
            multerUpload.single('file'),
            this.uploadFile
        );
    }

    private readonly uploadFile = async (req: Request, res: Response) => {
        const { file } = req;

        if (!file) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ServerErrors.UNSUPPORTED_FILE);
        }

        return res
            .status(StatusCodes.OK)
            .json(
                `${process.env.BASE_URL || 'http://localhost:3000/'}${
                    file.filename
                }`
            );
    };
}
