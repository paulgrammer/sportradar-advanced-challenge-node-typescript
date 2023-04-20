import { ensureDb } from "../utils";

async function dropTable() {
  const args = process.argv.slice(2);
  const table_name = args[0];
  const dataSource = await ensureDb();
  const queryRunner = dataSource.createQueryRunner();
  let gamesTable = await queryRunner.getTable(table_name);
  await queryRunner.dropTable(gamesTable);
  process.exit(0);
}

dropTable();
