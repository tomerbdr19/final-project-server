import { IController } from '@/types/Controller';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Post } from '../models';
import { IPost } from 'models/Post.model';

export class PostController implements IController {
    path: string = '/post';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getPosts);
        this.router.post(`${this.path}`, this.createPost);
        this.router.delete(`${this.path}`, this.deletePost);
    }

    private readonly getPosts = async (
        req: Request<{}, {}, {}, { businessId: string }>,
        res: Response
    ) => {
        const { businessId } = req.query;

        return Post.find({ businessId })
            .then((posts) => {
                if (!posts) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                }

                return res.status(StatusCodes.OK).json({ posts });
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly createPost = async (
        req: Request<{}, {}, IPost>,
        res: Response
    ) => {
        const { businessId, content, imageUrl } = req.body;

        return new Post({
            businessId,
            content,
            imageUrl,
            createdAt: new Date()
        })
            .save()
            .then((post) => res.status(StatusCodes.OK).json(post))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly deletePost = async (
        req: Request<{}, {}, {}, { postId: string }>,
        res: Response
    ) => {
        const { postId } = req.query;

        return Post.findByIdAndDelete(postId)
            .then((doc) => {
                if (!doc) {
                    return res.status(StatusCodes.NOT_FOUND);
                }
                return res.status(StatusCodes.OK);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };
}
