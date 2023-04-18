import { Service } from "typedi";
import { DataAccessLayer } from "../database/dataAccess";

interface Team {
    id: string
    type: string
    name: string
}

@Service()
export class TeamService {
    constructor(private readonly dataAccess: DataAccessLayer) {}

    async teamExist(teamId: string): Promise<boolean> {
        return (await this.dataAccess.getTeamById(teamId)) ? true : false;
    }

    async getTeamById(teamId: string): Promise<Team | null> {
        const payload: string | null = await this.dataAccess.getTeamById(teamId);
        if (!payload)
            return null;
        return JSON.parse(payload);
    }

    async updateName(teamId: string, name: string) {
        await this.dataAccess.updateTeamName(teamId, name);
    }
}