import express from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());

app.get("/todos", (req, res) => {
    const result = fs.promises.readFile("db.json", "utf-8");

    result
        .then((data) => {
            res.status(200).json({
                data: JSON.parse(data),
            });
        })
        .catch((err) => {
            res.status(500).send();
        });
});

app.post("/todos", (req, res) => {
    const { body } = req;

    fs.promises
        .readFile("db.json", "utf-8")
        .then((data) => {
            const todo = {
                id: uuid(),
                task: body.task,
                status: body.status,
            };
            const parsedData = JSON.parse(data);
            parsedData.push(todo);
            return parsedData;
        })
        .then((parsedData) => {
            return fs.promises.writeFile("db.json", JSON.stringify(parsedData));
        })
        .then(() => {
            res.status(201).json({
                message: "Success",
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: err,
            });
        });
});

const PORT = 4000;

app.listen(PORT, () => {
    console.log("Process is running on ", PORT);
});
