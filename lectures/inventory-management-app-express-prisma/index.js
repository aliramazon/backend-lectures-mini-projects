import express from "express";
import { prisma } from "./src/prisma/index.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/products", async (req, res) => {
    const { body } = req;

    try {
        await prisma.product.create({
            data: body,
        });

        res.status(201).json({
            message: "Success",
        });
    } catch (error) {
        res.status(500).json({
            message: error,
        });
    }
});

app.get("/products", async (req, res) => {
    try {
        const products = await prisma.product.findMany({});

        res.status(201).json({
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            message: error,
        });
    }
});

app.get("/products/:id", async (req, res) => {
    try {
        const { params } = req;
        const product = await prisma.product.findUnique({
            where: {
                id: params.id,
            },
        });

        res.status(201).json({
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            message: error,
        });
    }
});

app.delete("/products/:id", async (req, res) => {
    try {
        const { params } = req;
        await prisma.product.delete({
            where: {
                id: params.id,
            },
        });

        res.status(200).json({
            message: "Success",
        });
    } catch (error) {
        res.status(500).json({
            message: error,
        });
    }
});

app.patch("/products/:id", async (req, res) => {
    try {
        const { params, body } = req;
        const quantity = {};

        if (body.soldQuantity) {
            quantity.decrement = body.soldQuantity;
        }
        if (body.addedQuantity) {
            quantity.increment = body.addedQuantity;
        }
        await prisma.product.update({
            where: {
                id: params.id,
            },
            data: {
                name: body.name,
                quantity: {
                    ...quantity,
                },
            },
        });

        res.status(200).json({
            message: "Success",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error,
        });
    }
});

app.listen(PORT, () => {
    console.log("Server is running on ", PORT);
});
