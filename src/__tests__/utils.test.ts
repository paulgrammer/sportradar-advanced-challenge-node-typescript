import { DataSource } from "typeorm";
import { ensureDb, formatFeedData } from "../utils";
import { SportRadar } from "../sportradar";

describe("Utils", () => {
  test("Ensure database connection.", () => {
    return expect(ensureDb()).resolves.toBeInstanceOf(DataSource);
  });

  test("Returns well formatted and minimal feed.", () => {
    let gamePk = 2022021186;

    return SportRadar.feed(gamePk).then((data) => {
      const formatted = formatFeedData(data);
      expect(gamePk).toEqual(formatted.gamePk);
    });
  });
});
