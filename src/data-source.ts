import "reflect-metadata";
import { DataSource } from "typeorm";
import { Game } from "./entity/Game";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST ?? "localhost",
  port: 5432,
  username: "sportradar",
  password: "sportradar",
  database: "sportradar",
  synchronize: true,
  logging: false,
  entities: [Game],
  migrations: [],
  subscribers: [],
});
