import { Request, Response, Router } from "express";
import { LeagueService, User } from "../services/league";
import { Result, ValidationError, body, validationResult } from "express-validator"
import Container from "typedi";
import { HttpException } from "../exceptions/httpException";
require("express-async-errors");

interface UserDto {
    name: string
}

const router: Router = Router()
const leagueService: LeagueService = Container.get(LeagueService);

router.get('/:id/users', async (req: Request, res: Response) => {
    const users: User[] | null = await leagueService.getUsersByLeague(req.params.id);
    if (!users)
        throw new HttpException(404, "mpg_league not found");
    else {
        const usersDto: UserDto[] = users.map((e): UserDto => ({ name: e.name }));
        res.send({ users: usersDto });
    }
});

router.post('' ,
    body('id').exists().isString().notEmpty(),
    body('name').exists().isString().notEmpty(),
    body('description').exists().isString().notEmpty(),
    body('adminId').exists().isString().notEmpty(),
    async (req: Request, res: Response) => {
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty())
            throw new HttpException(400, "invalid arguments");
        if (await leagueService.leagueExist(req.body.id))
            throw new HttpException(409, "mpg_league already exist");
        if (!await leagueService.userExist(req.body.adminId))
            throw new HttpException(400, "user not found");
        
        await leagueService.createLeague(req.body);
        res.send();
    }
);

export default router;
