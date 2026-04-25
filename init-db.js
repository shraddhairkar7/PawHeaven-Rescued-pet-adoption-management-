/**
 * One-shot: create database + tables from animal_shelter.sql
 * Run: npm run init-db
 * Uses same env defaults as index.js (DB_HOST, DB_USER, DB_PASSWORD).
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

const password =
  process.env.DB_PASSWORD !== undefined
    ? process.env.DB_PASSWORD
    : "Shraddha@07";

const conn = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password,
  multipleStatements: true,
});

const sqlPath = path.join(__dirname, "animal_shelter.sql");

conn.connect((err) => {
  if (err) {
    console.error("Could not connect to MySQL:", err.message);
    process.exit(1);
  }
  if (!fs.existsSync(sqlPath)) {
    console.error("Missing file:", sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, "utf8");
  conn.query(sql, (e) => {
    conn.end();
    if (e) {
      console.error("Error running animal_shelter.sql:", e.message);
      process.exit(1);
    }
    console.log("Done. Database `animal_shelter` is ready. Start the server with: npm start");
    process.exit(0);
  });
});
