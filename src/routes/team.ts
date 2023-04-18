import { Request, Response, Router } from "express";
import { Result, ValidationError, body, validationResult } from "express-validator";
import Container from "typedi";
import { TeamService } from "../services/team";
import { HttpException } from "../exceptions/httpException";
require("express-async-errors");

const router: Router = Router();
const teamService: TeamService = Container.get(TeamService);

router.patch("/:id/name",
    body('name').exists().isString().notEmpty(),
    async (req: Request, res: Response) => {
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty())
            throw new HttpException(400, "invalid arguments");
        if (!await teamService.teamExist(req.params.id))
            throw new HttpException(404, "mpg_team not found");
        await teamService.updateName(req.params.id, req.body.name);
        res.send();
    }
);

export default router;