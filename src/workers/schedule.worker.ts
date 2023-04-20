import { parentPort, workerData } from "worker_threads";
import { SportRadar } from "../sportradar";
import { scheduleJob, gracefulShutdown } from "node-schedule";
import { Logger } from "../logger";
import { formatDate } from "../utils";
import { Status, IGameResponse } from "../types";

const monitoring = new Map<number, boolean>();

// sent message
const send = (status: string, data: any) =>
  parentPort.postMessage({ status, data });

const monitorSchedule = (game: IGameResponse) => {
  let status = game.status.abstractGameState;

  // Before scheduling, check whether game is already started/live.
  if (game.status.abstractGameState === Status.LIVE) {
    send(Status.LIVE, game.gamePk);
    return;
  }

  // Game has ended, don't schedule to monitor it.
  if (game.status.abstractGameState === Status.FINAL) {
    Logger.log(
      `Couldn't monitor game ${game.gamePk}, reason=game already ended.`
    );

    return;
  }

  monitoring.set(game.gamePk, true);

  // Game data has "gameDate" field, use it to create a job to start monitoring match.
  const job = scheduleJob(
    {
      start: new Date(game.gameDate),
      tz: workerData.timeZone,
      rule: "*/10 * * * * *",
    },
    async () => {
      try {
        const feed = await SportRadar.feed(game.gamePk);
        status = feed.gameData.status.abstractGameState;

        // Check game status, if live, sent message to parent node and stop job
        if (status === Status.LIVE) {
          Logger.debug("Schedule", `Game ${game.gamePk} is live.`);
          // send message to parent
          send(Status.LIVE, game.gamePk);
          // remove game from monitoring list.
          monitoring.delete(game.gamePk);
          job.cancel();
        } else {
          Logger.debug(
            "Schedule",
            `Waiting for Game ${game.gamePk} to get live. current status=${status}`
          );
        }
      } catch (e) {
        Logger.error(e.message);
      }
    }
  );

  Logger.debug(
    "Schedule",
    `Waiting for ${game.gamePk} to start at ${formatDate(
      game.gameDate,
      workerData.timeZone
    )} timezone=${workerData.timeZone}`
  );
};

const fetchGames = async () => {
  try {
    const data = await SportRadar.schedule(
      `date=${new Date().toISOString().slice(0, 10)}`
    );
    // Only select those which are not monitored yet.
    const games = data.filter((game: any) => !monitoring.has(game));
    games.forEach(monitorSchedule);
  } catch (e) {}
};

// fetch games
fetchGames();

// Fetch schedule every 30 minutes
scheduleJob("*/30 * * * *", fetchGames);

// gracefully shutdown jobs when a system interrupt occurs.
process.on("SIGINT", function () {
  gracefulShutdown().then(() => process.exit(0));
});
