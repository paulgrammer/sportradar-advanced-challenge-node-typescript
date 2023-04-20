import { parentPort, workerData } from "worker_threads";
import { gracefulShutdown, scheduleJob } from "node-schedule";
import { SportRadar } from "../sportradar";
import { Status } from "../types";
import { formatFeedData } from "../utils";

const send = (status: string, data: any) =>
  parentPort.postMessage({ status, data });

// fetch updates every 10 seconds
const job = scheduleJob("*/10 * * * * *", async () => {
  try {
    const feed = await SportRadar.feed(workerData.game);
    const formatted = formatFeedData(feed);

    // send updates
    send(Status.UPDATE, formatted);

    // if game ends, sens signal parent node to stop monitoring
    if (formatted.status === Status.FINAL) {
      send(Status.FINAL, feed.gamePk);
      job.cancel();
    }
  } catch (e) {}
});

process.on("SIGINT", function () {
  gracefulShutdown().then(() => process.exit(0));
});
