export interface IGameResponse {
  gamePk: number;
  season: string;
  gameDate: string;
  status: {
    abstractGameState: string;
  };
}

export interface IGameData {
  game: {
    pk: string;
    season: string;
    type: string;
  };
  datetime: {
    dateTime: string;
    endDateTime: string;
  };
  status: {
    abstractGameState: string;
    codedGameState: string;
    detailedState: string;
    statusCode: string;
    startTimeTBD: false;
  };
  teams: {
    [key: string]: {
      id: number;
      name: string;
      link: string;
      venue: {
        id: number;
        name: string;
        link: string;
        city: string;
        timeZone: {
          id: string;
          offset: number;
          tz: string;
        };
      };
      abbreviation: string;
      triCode: string;
      teamName: string;
      locationName: string;
      firstYearOfPlay: string;
      division: {
        id: number;
        name: string;
        nameShort: string;
        link: string;
        abbreviation: string;
      };
      conference: {
        id: number;
        name: string;
        link: string;
      };
      franchise: {
        franchiseId: number;
        teamName: number;
        link: string;
      };
      shortName: string;
      officialSiteUrl: string;
      franchiseId: number;
      active: boolean;
    };
  };
  players: {
    [key: string]: {
      id: number;
      fullName: string;
      link: string;
      firstName: string;
      lastName: string;
      primaryNumber: string;
      birthDate: string;
      currentAge: number;
      birthCity: string;
      birthStateProvince: string;
      birthCountry: string;
      nationality: string;
      height: string;
      weight: number;
      active: boolean;
      alternateCaptain: boolean;
      captain: boolean;
      rookie: boolean;
      shootsCatches: string;
      rosterStatus: string;
      currentTeam: {
        id: number;
        name: string;
        link: string;
        triCode: string;
      };
      primaryPosition: {
        code: string;
        name: string;
        type: string;
        abbreviation: string;
      };
    };
  };
}

interface ILiveData {
  linescore: {
    teams: {
      [key: string]: {
        goals: number;
      };
    };
  };

  boxscore: {
    teams: {
      [key: string]: {
        teamStats: {
          teamSkaterStats: {
            goals: number;
            hits: number;
          };
        };

        players: {
          [id: string]: {
            stats: {
              skaterStats: {
                assists: number;
                goals: number;
                shots: number;
                hits: number;
              };
            };
          };
        };
      };
    };
  };
}

export interface IFeedResponse {
  copyright: number;
  gamePk: number;
  link: string;
  metaData: {
    wait: number;
    timeStamp: string;
  };
  gameData: IGameData;
  liveData: ILiveData;
}

export enum Status {
  LIVE = "Live",
  FINAL = "Final",
  UPDATE = "Update",
}

export enum Side {
  HOME = "home",
  AWAY = "away",
}

export interface IHashMapGeneric<T> {
  [id: string]: T;
}
