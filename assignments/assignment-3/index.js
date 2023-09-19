const http = require("http");
const { v4: uuid, validate } = require("uuid");

const port = 3000;
const host = "localhost";

let stories = {};

const verifyPathMatchStories = (path) => {
    const parts = path.split("/");
    return parts.length === 3 && parts[1] === "stories" && validate(parts[2]);
};

const verifyPathMatchTasks = (path) => {
    const parts = path.split("/");
    return (
        parts.length === 5 &&
        parts[1] === "stories" &&
        validate(parts[2]) &&
        parts[3] === "tasks" &&
        validate(parts[4])
    );
};

const getAllStories = (res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(stories));
};

const createStory = (req, res) => {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        const newStory = JSON.parse(data);
        const id = uuid();
        stories[id] = { id, ...newStory, tasks: {} };
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(stories[id]));
    });
};

const getStory = (res, storyId) => {
    if (stories[storyId]) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(stories[storyId]));
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Story not found" }));
    }
};

const updateStoryStatus = (req, res, storyId) => {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        const updatedStatus = JSON.parse(data).status;
        if (stories[storyId]) {
            stories[storyId].status = updatedStatus;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(stories[storyId]));
        } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Story not found" }));
        }
    });
};

const deleteStory = (res, storyId) => {
    if (stories[storyId]) {
        delete stories[storyId];
        res.writeHead(204, { "Content-Type": "application/json" });
        res.end();
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Story not found" }));
    }
};

// Functions to perform CRUD operations on subtasks
const getAllSubtasks = (res, storyId) => {
    if (stories[storyId]) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(stories[storyId].tasks));
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Story not found" }));
    }
};

const createSubtask = (req, res, storyId) => {
    if (stories[storyId]) {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });

        req.on("end", () => {
            const newTask = JSON.parse(data);
            const taskId = uuid();
            stories[storyId].tasks[taskId] = { id: taskId, ...newTask };
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(stories[storyId].tasks[taskId]));
        });
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Story not found" }));
    }
};

const getSubtask = (res, storyId, taskId) => {
    if (stories[storyId] && stories[storyId].tasks[taskId]) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(stories[storyId].tasks[taskId]));
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Subtask or Story not found" }));
    }
};

const updateSubtaskStatus = (req, res, storyId, taskId) => {
    if (stories[storyId] && stories[storyId].tasks[taskId]) {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });

        req.on("end", () => {
            const updatedStatus = JSON.parse(data).status;
            stories[storyId].tasks[taskId].status = updatedStatus;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(stories[storyId].tasks[taskId]));
        });
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Subtask or Story not found" }));
    }
};

const deleteSubtask = (res, storyId, taskId) => {
    if (stories[storyId] && stories[storyId].tasks[taskId]) {
        delete stories[storyId].tasks[taskId];
        res.writeHead(204, { "Content-Type": "application/json" });
        res.end();
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Subtask or Story not found" }));
    }
};

const server = http.createServer((req, res) => {
    const parts = req.url.split("/");
    const isPathMatchStories = verifyPathMatchStories(req.url);
    const isPathMatchTasks = verifyPathMatchTasks(req.url);

    if (req.url === "/stories" && req.method === "GET") {
        getAllStories(res);
    } else if (req.url === "/stories" && req.method === "POST") {
        createStory(req, res);
    } else if (isPathMatchStories && req.method === "GET") {
        getStory(res, parts[2]);
    } else if (isPathMatchStories && req.method === "PUT") {
        updateStoryStatus(req, res, parts[2]);
    } else if (isPathMatchStories && req.method === "DELETE") {
        deleteStory(res, parts[2]);
    } else if (
        isPathMatchStories &&
        parts[3] === "tasks" &&
        req.method === "GET"
    ) {
        getAllSubtasks(res, parts[2]);
    } else if (
        isPathMatchStories &&
        parts[3] === "tasks" &&
        req.method === "POST"
    ) {
        createSubtask(req, res, parts[2]);
    } else if (isPathMatchTasks && req.method === "GET") {
        getSubtask(res, parts[2], parts[4]);
    } else if (isPathMatchTasks && req.method === "PUT") {
        updateSubtaskStatus(req, res, parts[2], parts[4]);
    } else if (isPathMatchTasks && req.method === "DELETE") {
        deleteSubtask(res, parts[2], parts[4]);
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid URL or HTTP method" }));
    }
});

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
