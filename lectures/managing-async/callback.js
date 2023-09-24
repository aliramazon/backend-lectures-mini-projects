import express from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";

const app = express();
app.use(express.json());

app.post("/todos", (req, res) => {
    const { body } = req;
    fs.readFile("data.json", "utf-8", (err, data) => {
        if (err) {
            res.status(500).json({
                message: "Internal error",
            });
            return;
        }
        if (data) {
            const todo = {
                id: uuid(),
                task: body.task,
                status: "todo",
            };
            const parsedData = JSON.parse(data);
            parsedData.push(todo);
            fs.writeFile("data.json", JSON.stringify(parsedData), (err) => {
                if (err) {
                    res.status(500).json({
                        message: "Internal error",
                    });
                    return;
                }

                res.status(201).json({
                    message: "Success",
                });
            });
        }
    });
});

const PORT = 4000;

app.listen(PORT, () => {
    console.log("Process is running on ", PORT);
});
