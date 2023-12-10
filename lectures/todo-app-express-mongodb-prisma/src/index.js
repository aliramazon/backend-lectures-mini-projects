import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./prisma/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/health", (_, res) => {
    res.status(200).json("Success");
});

app.post("/tasks", async (req, res) => {
    const {
        body: { text },
    } = req;
    if (!text || (text && text.length < 3)) {
        res.status(400).json({
            message: "Task is not valid",
        });

        return;
    }

    try {
        const task = await prisma.task.create({
            data: {
                text,
            },
        });

        res.status(201).json({
            data: task,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

app.get("/tasks", async (_, res) => {
    try {
        const tasks = await prisma.task.findMany();

        res.status(200).json({
            data: tasks,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

app.patch("/tasks/:id", async (req, res) => {
    const {
        params: { id },
        body: { status },
    } = req;

    if (!["TODO", "INPROGRESS", "DONE"].includes(status)) {
        res.status(400).json({
            message: "Not Valid Status",
        });

        return;
    }
    try {
        const task = await prisma.task.findUnique({
            where: {
                id,
            },
        });

        if (!task) {
            res.status(404).json({
                message: "Task is not found",
            });
            return;
        }

        await prisma.task.update({
            where: {
                id,
            },
            data: {
                status: status,
            },
        });

        res.status(203).send();
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    const {
        params: { id },
    } = req;
    try {
        const task = await prisma.task.findUnique({
            where: {
                id,
            },
        });

        if (!task) {
            res.status(404).json({
                message: "Task is not found",
            });
            return;
        }

        await prisma.task.delete({
            where: {
                id,
            },
        });

        res.status(203).send();
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }

    app.patch("/tasks/:id", async (req, res) => {
        const {
            params: { id },
            body: { status },
        } = req;

        if (!["TODO", "INPROGRESS", "DONE"].includes(status)) {
            res.status(400).json({
                message: "Not Valid Status",
            });
        }
        try {
            const task = await prisma.task.findUnique({
                where: {
                    id,
                },
            });

            if (!task) {
                res.status(404).json({
                    message: "Task is not found",
                });
            }

            await prisma.task.delete({
                where: {
                    id,
                },
            });

            res.status(203).send();
        } catch (err) {
            res.status(500).json({
                message: err.message,
            });
        }
    });
});

app.listen(PORT, () => {
    console.log("Server is running on ", PORT);
});
