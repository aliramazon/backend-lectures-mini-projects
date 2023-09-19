import { express } from "express";
import { v4 as uuid, validate } from "uuid";

const app = express();
const port = 3000;

app.use(express.json());

const stories = {};

// Stories Routes

// GET /stories: Retrieve all stories
app.get("/stories", (req, res) => {
    res.json(stories);
});

// POST /stories: Create a new story
app.post("/stories", (req, res) => {
    const id = uuid();
    const { name, description, status } = req.body;
    stories[id] = { id, name, description, status, tasks: {} };
    res.status(201).json(stories[id]);
});

// GET /stories/:id: Retrieve a specific story by ID
app.get("/stories/:id", (req, res) => {
    const { id } = req.params;
    if (!validate(id) || !stories[id]) {
        return res.status(404).json({ message: "Story not found" });
    }
    res.json(stories[id]);
});

// PUT /stories/:id: Update a specific story by ID
app.put("/stories/:id", (req, res) => {
    const { id } = req.params;
    if (!validate(id) || !stories[id]) {
        return res.status(404).json({ message: "Story not found" });
    }
    const { name, description, status } = req.body;
    stories[id] = { ...stories[id], name, description, status };
    res.json(stories[id]);
});

// DELETE /stories/:id: Delete a specific story by ID
app.delete("/stories/:id", (req, res) => {
    const { id } = req.params;
    if (!validate(id) || !stories[id]) {
        return res.status(404).json({ message: "Story not found" });
    }
    delete stories[id];
    res.status(204).send();
});

// Sub-Tasks Routes

// GET /stories/:id/tasks: Retrieve all sub-tasks for a specific story
app.get("/stories/:id/tasks", (req, res) => {
    const { id } = req.params;
    if (!validate(id) || !stories[id]) {
        return res.status(404).json({ message: "Story not found" });
    }
    res.json(stories[id].tasks);
});

// POST /stories/:id/tasks: Create a new sub-task for a specific story
app.post("/stories/:id/tasks", (req, res) => {
    const { id } = req.params;
    if (!validate(id) || !stories[id]) {
        return res.status(404).json({ message: "Story not found" });
    }
    const taskId = uuid();
    const { name, description, status } = req.body;
    stories[id].tasks[taskId] = { id: taskId, name, description, status };
    res.status(201).json(stories[id].tasks[taskId]);
});

// GET /stories/:id/tasks/:taskId: Retrieve a specific sub-task by ID within a specific story
app.get("/stories/:id/tasks/:taskId", (req, res) => {
    const { id, taskId } = req.params;
    if (
        !validate(id) ||
        !stories[id] ||
        !validate(taskId) ||
        !stories[id].tasks[taskId]
    ) {
        return res.status(404).json({ message: "Sub-Task not found" });
    }
    res.json(stories[id].tasks[taskId]);
});

// PUT /stories/:id/tasks/:taskId: Update a specific sub-task by ID within a specific story
app.put("/stories/:id/tasks/:taskId", (req, res) => {
    const { id, taskId } = req.params;
    if (
        !validate(id) ||
        !stories[id] ||
        !validate(taskId) ||
        !stories[id].tasks[taskId]
    ) {
        return res.status(404).json({ message: "Sub-Task not found" });
    }
    const { name, description, status } = req.body;
    stories[id].tasks[taskId] = {
        ...stories[id].tasks[taskId],
        name,
        description,
        status,
    };
    res.json(stories[id].tasks[taskId]);
});

// DELETE /stories/:id/tasks/:taskId: Delete a specific sub-task by ID within a specific story
app.delete("/stories/:id/tasks/:taskId", (req, res) => {
    const { id, taskId } = req.params;
    if (
        !validate(id) ||
        !stories[id] ||
        !validate(taskId) ||
        !stories[id].tasks[taskId]
    ) {
        return res.status(404).json({ message: "Sub-Task not found" });
    }
    delete stories[id].tasks[taskId];
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
