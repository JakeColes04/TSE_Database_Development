// changed type to "modeule" in package.json, so we need to use "import" instead of require()
import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();  // Now define 'app' after imports

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Farm Management API is running...");
});



// *** Database Development***
// get all Fields
app.get("/fields", async (req, res) => {
  try {
    const [fields] = await db.query("SELECT * FROM Fields");
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all tasks
app.get("/tasks", async (req, res) => {
  
  try {
    const [tasks] = await db.query("SELECT * FROM Tasks");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create new task
app.post("/tasks", async (req, res) => {

  console.log("💬 Incoming data:", req.body); // NEW LOGGING LINE
  
  const { Task_name, Field_ID, Required_Skills, Num_of_workers, Task_Time, account_id } = req.body;

  // Check if account_id is provided
  if (!account_id) {
    console.error("Error: account_id is missing");
    return res.status(400).json({ error: "account_id is required" });
  }
    
  try {
    const [result] = await db.query(
      "INSERT INTO Tasks (Task_name, Field_ID, Required_Skills, Num_of_workers, Task_Time, account_id) VALUES (?, ?, ?, ?, ?, ?)",
      [Task_name, Field_ID, Required_Skills, Num_of_workers, Task_Time, account_id]
    );
    
    res.json({ id: result.insertId, Task_name, Field_ID, Required_Skills, Num_of_workers, Task_Time });
  } catch (err) {
    console.error("❌ DB Insert Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// create new worker
// get tasks os specific field
app.get("/fields/:id/tasks", async (req, res) => {
  const { id } = req.params;
  try {
    const [tasks] = await db.query("SELECT * FROM Tasks WHERE Field_ID = ?", [id]);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// assign worker to the task
app.post("/assign-task", async (req, res) => {
  const { Worker_ID, Task_ID } = req.body;
  try {
    await db.query("UPDATE Workers SET current_task_id = ? WHERE Worker_ID = ?", [Task_ID, Worker_ID]);
    res.json({ message: "Task assigned successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
