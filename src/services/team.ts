import { Service } from "typedi";
import { DataAccessLayer } from "../database/dataAccess";

interface Team {
    id: string
    type: string
    name: string
}

@Service()
export class TeamService {
    constructor(private readonly teamDal: DataAccessLayer) {}

    async teamExist(teamId: string): Promise<boolean> {
        return (await this.teamDal.getTeamById(teamId)) ? true : false;
    }

    async getTeamById(teamId: string): Promise<Team | null> {
        const payload: string | null = await this.teamDal.getTeamById(teamId);
        if (!payload)
            return null;
        return JSON.parse(payload);
    }

    async updateName(teamId: string, name: string) {
        await this.teamDal.updateTeamName(teamId, name);
    }
}