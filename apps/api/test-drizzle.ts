import { createDb } from "@mphm/db";

async function test() {
  const db = createDb({} as any);
  console.log("db.run is function:", typeof (db as any).run === "function");
  console.log("db.all is function:", typeof (db as any).all === "function");
  console.log("db.execute is function:", typeof (db as any).execute === "function");
  console.log("db.get is function:", typeof (db as any).get === "function");
}
test();
