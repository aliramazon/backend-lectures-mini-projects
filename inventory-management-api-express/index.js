// Import required modules
import express from "express";
import { v4 as uuid, validate as uuidValidate } from "uuid";

// Initialize the Express app
const app = express();
app.use(express.json());

// In-memory database
const customers = {};
const products = {};
const orders = {};

// Customer Routes

app.get("/customers", (req, res) => {
    res.json(customers);
});

app.get("/customers/:id", (req, res) => {
    const { id } = req.params;
    if (uuidValidate(id) && customers[id]) {
        res.json(customers[id]);
    } else {
        res.status(404).send("Customer not found");
    }
});

app.post("/customers", (req, res) => {
    const id = uuid();
    const { name, email } = req.body;
    customers[id] = { id, name, email };
    res.status(201).json(customers[id]);
});

app.put("/customers/:id", (req, res) => {
    const { id } = req.params;
    if (uuidValidate(id) && customers[id]) {
        const { name, email } = req.body;
        customers[id] = { ...customers[id], name, email };
        res.json(customers[id]);
    } else {
        res.status(404).send("Customer not found");
    }
});

app.delete("/customers/:id", (req, res) => {
    const { id } = req.params;
    if (uuidValidate(id) && customers[id]) {
        delete customers[id];
        res.status(204).send();
    } else {
        res.status(404).send("Customer not found");
    }
});

// Product Routes

app.get("/products", (req, res) => {
    res.json(products);
});

app.get("/products/:id", (req, res) => {
    const { id } = req.params;
    if (uuidValidate(id) && products[id]) {
        res.json(products[id]);
    } else {
        res.status(404).send("Product not found");
    }
});

app.post("/products", (req, res) => {
    const id = uuid();
    const { name, price } = req.body;
    products[id] = { id, name, price };
    res.status(201).json(products[id]);
});

app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    if (uuidValidate(id) && products[id]) {
        const { name, price } = req.body;
        products[id] = { ...products[id], name, price };
        res.json(products[id]);
    } else {
        res.status(404).send("Product not found");
    }
});

app.delete("/products/:id", (req, res) => {
    const { id } = req.params;
    if (uuidValidate(id) && products[id]) {
        delete products[id];
        res.status(204).send();
    } else {
        res.status(404).send("Product not found");
    }
});

// Order Routes

app.get("/orders", (req, res) => {
    res.json(orders);
});

app.get("/orders/:id", (req, res) => {
    const { id } = req.params;
    if (uuidValidate(id) && orders[id]) {
        res.json(orders[id]);
    } else {
        res.status(404).send("Order not found");
    }
});

app.post("/orders", (req, res) => {
    const { customerId, productIds } = req.body;
    if (
        uuidValidate(customerId) &&
        customers[customerId] &&
        productIds.every((id) => uuidValidate(id) && products[id])
    ) {
        const id = uuid();
        orders[id] = { id, customerId, productIds };
        res.status(201).json(orders[id]);
    } else {
        res.status(400).send("Bad Request: Invalid Customer ID or Product IDs");
    }
});

app.put("/orders/:id", (req, res) => {
    const { id } = req.params;
    if (uuidValidate(id) && orders[id]) {
        const { customerId, productIds } = req.body;
        if (
            uuidValidate(customerId) &&
            customers[customerId] &&
            productIds.every((id) => uuidValidate(id) && products[id])
        ) {
            orders[id] = { ...orders[id], customerId, productIds };
            res.json(orders[id]);
        } else {
            res.status(400).send(
                "Bad Request: Invalid Customer ID or Product IDs"
            );
        }
    } else {
        res.status(404).send("Order not found");
    }
});

app.delete("/orders/:id", (req, res) => {
    const { id } = req.params;
    if (uuidValidate(id) && orders[id]) {
        delete orders[id];
        res.status(204).send();
    } else {
        res.status(404).send("Order not found");
    }
});

// Run the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
