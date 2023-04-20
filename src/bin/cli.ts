import { Logger } from "../logger";
import { DataSource } from "typeorm";
import { ensureDb } from "../utils";
import { Game } from "../entity/Game";
import { IHashMapGeneric } from "../types";

const exit = () => process.kill(0);
const args = process.argv.slice(2);
const command = args[0];

// query params
const queryParams = (() => {
  const parse = (name: string) => {
    let opt = args.find((arg) => arg.startsWith(`--${name}=`));
    if (opt) return opt.split("=")[1];
  };

  let q: IHashMapGeneric<string> = {};
  const gamePk = parse("game_id");
  const season = parse("season");

  if (gamePk) q["gamePk"] = gamePk;
  if (season) q["season"] = season;
  return q;
})();

let dataSource: DataSource;
let interval: ReturnType<typeof setInterval>;

async function query() {
  try {
    if (!dataSource) {
      dataSource = await ensureDb();
    }

    const data = await dataSource.getRepository(Game).findBy(queryParams);
    // game data
    Logger.log((data.length > 1 ? data : data[0]) || "No games found!");
  } catch (e: any) {
    Logger.error(`Failed to perform request: ${e.message}`);
    return exit();
  }

  // Repeat call if request has --live flag. [realtime db feed]
  if (args.includes("--live")) {
    if (!interval) {
      interval = setInterval(query, 1000);
    }

    return;
  }

  // exit
  exit();
}

// switch through commands
switch (command) {
  case "games":
    query();
    break;

  default:
    Logger.error("Command not found!");
    break;
}

// if process exits, disconnect for db, stop watching feed
process.on("exit", () => {
  if (interval) clearInterval(interval);
  if (dataSource) dataSource.destroy();
});
