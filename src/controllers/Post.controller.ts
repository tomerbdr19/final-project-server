import { IController } from '@types';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Post, IPost, Subscription, ISubscription, IBusiness } from '@models';
export class PostController implements IController {
    path: string = '/post';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getPosts);
        this.router.get(`${this.path}/recent`, this.getUserRecentPost);
        this.router.post(`${this.path}`, this.createPost);
        this.router.post(`${this.path}/delete`, this.deletePost);
    }

    private readonly getPosts = async (
        req: Request<{}, {}, {}, { business: string }>,
        res: Response
    ) => {
        const { business } = req.query;

        return Post.find({ business })
            .populate('business', ['imageUrl', 'name'])
            .sort({ createdAt: -1 })
            .exec()
            .then((posts) => {
                return res.status(StatusCodes.OK).json(posts);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly createPost = async (
        req: Request<{}, {}, IPost>,
        res: Response
    ) => {
        const { business, caption, imageUrl } = req.body;

        return new Post({
            business: (business as IBusiness).id,
            caption,
            imageUrl,
            createdAt: new Date()
        })
            .save()
            .then((post) => post.populate('business'))
            .then((post) => res.status(StatusCodes.OK).json(post))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly deletePost = async (
        req: Request<{}, {}, { post: string }>,
        res: Response
    ) => {
        const { post } = req.body;

        return Post.findByIdAndDelete(post)
            .then((post) => {
                if (!post) {
                    return res.status(StatusCodes.NOT_FOUND);
                }
                return res.status(StatusCodes.OK).json(post);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly getUserRecentPost = async (
        req: Request<{}, {}, {}, { user: string; page: number }>,
        res: Response
    ) => {
        const { user, page = 0 } = req.query;

        try {
            const userSubscriptions = await Subscription.find({
                user
            }).then((_) => _);

            const subscribedBusinesses = (
                userSubscriptions as ISubscription[]
            ).map((_) => _.business);

            return Post.find({ business: { $in: subscribedBusinesses } })
                .populate('business', ['imageUrl', 'name'])
                .sort({ createdAt: -1 })
                .exec()
                .then((posts) => res.status(StatusCodes.OK).json(posts));
        } catch {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
        }
    };
}
