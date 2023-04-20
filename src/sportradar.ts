import https from "https";
import { IFeedResponse, IGameResponse } from "./types";

export class SportRadar {
  /**
   * Simple http client, for now, it only allows get requests.
   * @param path request path
   * @returns sportradar api response
   */
  private static fetch<T>(path?: string) {
    return new Promise<T>((resolve, reject) => {
      https
        .get(`https://statsapi.web.nhl.com/api/v1/${path}`, (res) => {
          let data: any = [];

          res.on("data", (chunk) => {
            data.push(chunk);
          });

          res.on("end", () => {
            resolve(JSON.parse(Buffer.concat(data).toString()));
          });
        })
        .on("error", reject);
    });
  }

  /**
   * Returns a list of data about the schedule.
   * @returns []
   */
  static async schedule(params?: string): Promise<IGameResponse[]> {
    type IDate = {
      games: IGameResponse[];
    };

    // response type
    type IScheduleResponse = { dates: IDate[] };

    // Request schedule
    const { dates } = await this.fetch<IScheduleResponse>(`schedule?${params}`);
    // Map games
    let games: IGameResponse[] = [];

    // Concat all games for given dates together.
    games = dates.reduce((prev, current) => {
      return prev.concat(current.games);
    }, games);

    return games;
  }

  /**
   *  Returns all data about a specified game id.
   * @param gamePk game id
   * @returns Game
   */
  static async feed(gamePk: string | number) {
    const data = await this.fetch<IFeedResponse>(`game/${gamePk}/feed/live`);
    return data;
  }
}
