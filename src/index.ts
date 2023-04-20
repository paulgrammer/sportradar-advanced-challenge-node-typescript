import path from "path";
import { Worker } from "worker_threads";
import { Logger } from "./logger";
import { ensureDb, isProduction } from "./utils";
import { Status } from "./types";
import { DataSource } from "typeorm";
import { Game } from "./entity/Game";

// pipeline
async function runPipeline(dataSource: DataSource) {
  // Games watched and their threadid
  const monitoring = new Map<string, number>();

  type IMessage = {
    status: string;
    data: any;
  };

  // Resolve worker path
  const workerPath = (name: string) => path.join(__dirname, "workers", name);

  const scheduleWorker = new Worker(workerPath("schedule.worker.js"), {
    workerData: {
      timeZone: process.env.TZ ?? "America/New_York",
      ...(!isProduction && { path: workerPath("schedule.worker.ts") }),
    },
  });

  scheduleWorker.on("message", (msg: IMessage) => {
    Logger.debug("Schedule Worker", msg);
    if (msg.status === Status.LIVE) {
      const game = msg.data;

      // only if game is not monitored.
      if (!monitoring.has(game)) {
        // Feed worker
        const feedWorker = new Worker(workerPath("feed.worker.js"), {
          workerData: {
            game,
            path: workerPath("feed.worker.ts"),
            ...(!isProduction && { path: workerPath("feed.worker.ts") }),
          },
        });

        // monitor game
        monitoring.set(game, feedWorker.threadId);

        feedWorker.on("message", async (msg: IMessage) => {
          if (msg.status === Status.UPDATE) {
            Logger.debug(
              "Feed Worker",
              `game=${msg.data.gamePk}, status=${msg.data.status}, cmd=${msg.status}`
            );
            // save updates
            const gameRepository = dataSource.getRepository(Game);
            await gameRepository.upsert(msg.data, ["gamePk"]);
          }

          // If game has ended
          if (msg.status === Status.FINAL) {
            // Remove from watch list
            monitoring.delete(msg.data);
            // Terminate worker
            feedWorker.terminate();
          }
        });
      }
    }
  });
}

// Ensure database connection, then pipeline
ensureDb()
  .then(async (dataSource) => {
    Logger.log("Connected to database successfully.");
    runPipeline(dataSource);
  })
  .catch((e) => {
    Logger.error(e.message);
  });
