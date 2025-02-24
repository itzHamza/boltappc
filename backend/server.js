import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: "medstudy_db", // تأكد أن هذا هو الاسم الصحيح لقاعدة البيانات
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to MySQL database: medstudy");
  }
});

// جلب الفلاش كاردز بناءً على معرف الدرس
app.get("/flashcards", (req, res) => {
  const lessonId = req.query.lesson_id;
  if (!lessonId) return res.status(400).json({ error: "Lesson ID required" });

  const sql = "SELECT id, question, answer FROM flashcards WHERE lesson_id = ?";
  db.query(sql, [lessonId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
