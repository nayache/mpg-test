import { Bucket, Cluster, ConnectOptions, QueryResult, connect } from "couchbase";
import { Service } from "typedi";
import { HttpException } from "../services/httpException";
import * as dotenv from "dotenv";
require("express-async-errors")

dotenv.config();

@Service()
export class DataAccessLayer {
    private cluster:    Cluster | null = null;
    private bucket:     Bucket | null  = null;

    constructor() {
        console.log('DataAccessLayer() instance created')
    }

    async init() {
        const connectOptions: ConnectOptions = {
            username: `${process.env.CB_USERNAME}`,
            password: `${process.env.CB_PASSWORD}`,
            timeouts : {
                kvTimeout: 10000
            }
        }
        this.cluster = await connect('couchbase://couchbase', connectOptions);
        this.bucket = this.cluster.bucket(`${process.env.CB_BUCKET_NAME}`);
    }

    async getLeagueById(leagueId: string): Promise<string | null> {
        const queryRes: QueryResult = await this.bucket?.scope('_default').query(`SELECT * FROM _default WHERE type = 'mpg_league' AND id = '${leagueId}'`) as QueryResult;
        return (queryRes && queryRes.rows && queryRes.rows.length) ? JSON.stringify(queryRes.rows[0]._default) : null;
    }

    async getTeamById(teamId: string): Promise<string | null> {
        const queryRes: QueryResult = await this.bucket?.scope('_default').query(`SELECT * FROM _default WHERE type = 'mpg_team' AND id = '${teamId}'`) as QueryResult;
        return (queryRes && queryRes.rows && queryRes.rows.length) ? JSON.stringify(queryRes.rows[0]._default) : null;
    }

    async getUserById(userId: string): Promise<string | null> {
        const queryRes: QueryResult = await this.bucket?.scope('_default').query(`SELECT * FROM _default WHERE type = 'user' AND id = '${userId}'`) as QueryResult;
        return (queryRes && queryRes.rows && queryRes.rows.length) ? JSON.stringify(queryRes.rows[0]._default) : null;
    }

    async addLeague(key: string, value: string) {
        try {
            await this.bucket?.scope('_default').query(`INSERT INTO _default VALUES(${key}, ${value})`) as QueryResult;
        } catch (err) {
            throw new HttpException();
        }
    }

    async updateTeamName(teamId: string, name: string) {
        try {
            await this.bucket?.scope('_default').query(`UPDATE _default SET name = '${name}' WHERE type = 'mpg_team' AND id = '${teamId}'`);
        } catch(err) {
            throw new HttpException();
        }
    }

}