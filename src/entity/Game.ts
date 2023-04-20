import { Entity, Column, Unique, PrimaryColumn } from "typeorm";

export interface IPlayer {
  id: number;
  full_name: string;
  age: number;
  team_id: string;
  team_name: string;
  primary_number: string;
  primary_position: string;
  assists: string;
  hits: string;
  shots: string;
  // not yet
  points: string;
  penalty_minutes: string;
}

export interface IFeed {
  teams: {
    [key: string]: {
      id: number;
      name: string;
      goals: string;
      hits: string;
    };
  };
  players: IPlayer[];
}

@Entity()
@Unique(["gamePk"])
export class Game {
  @PrimaryColumn()
  gamePk: number;

  @Column()
  season: string;

  @Column()
  status: string;

  @Column("jsonb")
  feed: IFeed;
}
