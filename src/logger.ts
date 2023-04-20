import chalk from "chalk";

const logTime = () => {
  let nowDate = new Date();
  return (
    nowDate.toLocaleDateString() +
    " " +
    nowDate.toLocaleTimeString([], { hour12: false })
  );
};

const log = (...args: any[]) => {
  console.log(logTime(), process.pid, chalk.bold.green("[INFO]"), ...args);
};

const error = (...args: any[]) => {
  console.log(logTime(), process.pid, chalk.bold.red("[ERROR]"), ...args);
};

const debug = (worker: string, ...message: any[]) => {
  console.log(
    logTime(),
    process.pid,
    chalk.bold.blue(`[${worker.toUpperCase()}]`),
    ...message
  );
};

export const Logger = {
  log,
  error,
  debug,
};
