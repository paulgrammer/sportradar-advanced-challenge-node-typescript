import { SportRadar } from "../sportradar";

describe("Sportradar", () => {
  test("Returns a list of games scheduled", () => {
    return expect(SportRadar.schedule()).resolves.toBeInstanceOf(Array);
  });

  test("Returns all data about a specified game id", () => {
    let gamePk = 2022021189;

    return SportRadar.feed(gamePk).then((data) => {
      expect(gamePk).toEqual(data.gamePk);
    });
  });
});
