import { Logger } from "./logger";
import { AppDataSource } from "./data-source";
import { DataSource } from "typeorm";
import { IFeedResponse, Side } from "./types";

export const isProduction = (() => {
  return process.env.NODE_ENV === "production";
})();

// Initialize database
export function ensureDb() {
  const max_attempts = 10;
  let attempts = 0;

  return new Promise<DataSource>((resolve, reject) => {
    const connect = () => {
      if (attempts > 0)
        Logger.log("Reconnecting to database, attempts:", attempts);

      AppDataSource.initialize()
        .then(() => {
          resolve(AppDataSource);
        })
        .catch((error) => {
          if (attempts > max_attempts) return reject(error);

          // try to reconnect after 5 seconds
          attempts++;
          setTimeout(connect, 5000);
        });
    };

    connect();
  });
}

export function formatDate(dateString: string, timeZone: string) {
  const date = new Date(dateString);
  const edtDate = new Date(date.toLocaleString("en-US", { timeZone }));

  return edtDate.toLocaleString();
}

export function formatFeedData(feed: IFeedResponse) {
  const players = Object.values(feed.gameData.players).map((player) => {
    const playerSide =
      feed.gameData.teams[Side.AWAY]?.id == player.currentTeam.id
        ? Side.AWAY
        : Side.HOME;

    // player boxscore
    const boxscore =
      feed.liveData?.boxscore?.teams[playerSide]?.players[`ID${player.id}`]
        ?.stats?.skaterStats;

    return {
      id: player.id,
      full_name: player.fullName,
      age: player.currentAge,
      team_id: player.currentTeam.id,
      team_name: player.currentTeam.name,
      primary_number: player.primaryNumber,
      primary_position: player.primaryPosition.name,
      assists: boxscore?.assists ?? 0,
      goals: boxscore?.goals ?? 0,
      hits: boxscore?.hits ?? 0,
      shots: boxscore?.shots ?? 0,
    };
  });

  function getTeam(side: Side) {
    const team = feed.gameData.teams[side];
    // const goals = feed.liveData?.linescore?.teams[side]?.goals || 0;
    const boxscore =
      feed.liveData?.boxscore?.teams[side]?.teamStats?.teamSkaterStats;

    const hits = boxscore?.hits ?? 0;
    const goals = boxscore?.goals ?? 0;

    return {
      id: team.id,
      name: team.name,
      goals,
      hits,
    };
  }

  return {
    gamePk: feed.gamePk,
    season: feed.gameData.game.season,
    status: feed.gameData.status.abstractGameState,
    feed: {
      teams: {
        home: getTeam(Side.HOME),
        away: getTeam(Side.AWAY),
      },
      players,
    },
  };
}
