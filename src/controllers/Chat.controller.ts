import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Chat, Message, IMessage } from '@models';
import { IController, ServerErrors } from '@types';
import { getTruthyFilters } from '@utils/filter';

export class ChatController implements IController {
    path: string = '/chat';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(`${this.path}`, this.createChat);
        this.router.post(`${this.path}/status`, this.setChatStatus);
        this.router.post(`${this.path}/message`, this.sendMessage);
        this.router.get(`${this.path}/all`, this.getAllChats);
        this.router.get(`${this.path}`, this.getChat);
        this.router.get(`${this.path}/messages`, this.getChatMessages);
    }

    private readonly createChat = async (
        req: Request<{}, {}, { business: string; user: string }>,
        res: Response
    ) => {
        const { business, user } = req.body;

        return new Chat({ business, user })
            .save()
            .then((chat) => res.status(StatusCodes.OK).json(chat))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly setChatStatus = async (
        req: Request<
            {},
            {},
            {
                business: string;
                chat: string;
                status: 'new' | 'in-progress' | 'resolved';
            }
        >,
        res: Response
    ) => {
        const { business, chat, status } = req.body;

        return Chat.findOneAndUpdate(
            { business, _id: chat },
            { status },
            { new: true }
        )
            .populate('user')
            .populate('business')
            .exec()
            .then((chat) => res.status(StatusCodes.OK).json(chat))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly getAllChats = async (
        req: Request<{}, {}, {}, { user: string; business: string }>,
        res: Response
    ) => {
        const filters = getTruthyFilters(req.query);

        return Chat.find(filters)
            .sort({ updatedAt: -1 })
            .populate([
                { path: 'user', select: ['name', 'imageUrl', 'info'] },
                { path: 'business', select: ['name', 'imageUrl'] }
            ])
            .exec()
            .then((chats) => res.status(StatusCodes.OK).json(chats))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly getChat = async (
        req: Request<{}, {}, {}, { user: string; business: string }>,
        res: Response
    ) => {
        const { user, business } = req.query;

        return Chat.findOne({ user, business })
            .populate([
                { path: 'user', select: ['name', 'imageUrl', 'info'] },
                { path: 'business', select: ['name', 'imageUrl'] }
            ])
            .then(async (chat) => {
                if (!chat) {
                    return await (
                        await new Chat({ user, business }).save()
                    ).populate([
                        {
                            path: 'user',
                            select: ['name', 'imageUrl', 'info']
                        },
                        { path: 'business', select: ['name', 'imageUrl'] }
                    ]);
                }
                return chat;
            })
            .then((chat) => res.status(StatusCodes.OK).json(chat))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly getChatMessages = async (
        req: Request<{}, {}, {}, { chat: string }>,
        res: Response
    ) => {
        const { chat: chatId } = req.query;

        return Chat.findById(chatId)
            .populate([
                { path: 'user', select: ['name', 'imageUrl', 'info'] },
                { path: 'business', select: ['name', 'imageUrl'] }
            ])
            .exec()
            .then((chat) => {
                if (!chat) {
                    throw ServerErrors.NOT_FOUND;
                }
                return chat
                    .getChatMessages()
                    .then((messages) =>
                        res.status(StatusCodes.OK).json(messages)
                    );
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly sendMessage = async (
        req: Request<
            {},
            {},
            {
                sender: string;
                senderType: string;
                chat: string;
                content: string;
            }
        >,
        res: Response
    ) => {
        const { sender, senderType, chat, content } = req.body;

        return new Message({ sender, senderType, chat, content })
            .save()
            .then(async (message) => {
                await Chat.findByIdAndUpdate(chat, {
                    updatedAt: message.createdAt
                });
                return res.status(StatusCodes.OK).json(message);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };
}
