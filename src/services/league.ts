import { Service } from "typedi";
import { DataAccessLayer } from "../database/dataAccess";

export interface User {
    id: string
    type: string
    name: string
}

export interface League {
    adminId:        string
    description:    string
    id:             string
    name:           string
    type:           string
    usersTeams:     any[]
}

interface CreateLeague {
    id:             string
    name:           string
    adminId:        string
    description:    string
}

@Service()
export class LeagueService {
    constructor(private readonly leagueDal: DataAccessLayer) {
        console.log('LeagueService instance created()')
    }

    async leagueExist(leagueId: string): Promise<boolean> {
        return (await this.getLeagueById(leagueId)) ? true : false;
    }
    
    async userExist(userId: string): Promise<boolean> {
        return (await this.leagueDal.getUserById(userId)) ? true : false;
    }

    async getLeagueById(leagueId: string): Promise<League | null> {
        const payload: string | null = await this.leagueDal.getLeagueById(leagueId);
        if (!payload)
            return null
        return JSON.parse(payload);
    }

    async getUserById(userId: string): Promise<User | null> {
        const payload: string | null = await this.leagueDal.getUserById(userId);
        if (!payload)
            return null
        return JSON.parse(payload);
    }

    async getUsersByIds(userIds: string[]): Promise<User[]> {
        let users: User[] = [];
        for (const id of userIds) {
            const user: User | null = await this.getUserById(id);
            if (user)
                users.push(user);
        }
        return users;
    }

    async getUsersByLeague(leagueId: string): Promise<User[] | null> {
        const league: League | null = await this.getLeagueById(leagueId);
        if (!league)
            return null
        if (!league.usersTeams)
            return [];
        return this.getUsersByIds(Object.keys(league.usersTeams));
    }

    async createLeague(payload: CreateLeague) {
        const league: League = payload as League;
        league.type = 'mpg_league';
        
        await this.leagueDal.addLeague(JSON.stringify(league.id), JSON.stringify(league));
    }

}