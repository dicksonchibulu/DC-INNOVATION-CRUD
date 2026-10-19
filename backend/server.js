const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const app = express();
const PORT = process.env.PORT || 3000;
// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
// ==========================================
// WELCOME ROUTE
// ==========================================
app.get("/", (req, res) => {
    res.status(200).json({
        message: "DC INNOVATION Product Management API",
        status: "Running",
        endpoints: {
            getAllProducts: "GET /api/products",
            getOneProduct: "GET /api/products/:id",
            createProduct: "POST /api/products",
            updateProduct: "PUT /api/products/:id",
            deleteProduct: "DELETE /api/products/:id"
        }
    });
});
// ==========================================
// GET ALL PRODUCTS
// ==========================================
app.get("/api/products", (req, res) => {
    try {
        const products = db.prepare(
            "SELECT * FROM products ORDER BY id ASC"
        ).all();
        return res.status(200).json(products);
    } catch (error) {
        console.error("Error retrieving products:", error);
        return res.status(500).json({
            error: "Failed to retrieve products"
        });
    }
});
// ==========================================
// GET ONE PRODUCT
// ==========================================
app.get("/api/products/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: "A valid product ID is required"
            });
        }
        const product = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(id);
        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error("Error retrieving product:", error);
        return res.status(500).json({
            error: "Failed to retrieve product"
        });
    }
});
// ==========================================
// POST — CREATE A PRODUCT
// ==========================================
app.post("/api/products", (req, res) => {
    try {
        const {
            product_name,
            category,
            price,
            quantity,
            description = ""
        } = req.body || {};
        if (
            typeof product_name !== "string" ||
            !product_name.trim()
        ) {
            return res.status(400).json({
                error: "A valid product name is required"
            });
        }
        if (
            typeof category !== "string" ||
            !category.trim()
        ) {
            return res.status(400).json({
                error: "A valid product category is required"
            });
        }
        if (
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(Number(price)) ||
            Number(price) < 0
        ) {
            return res.status(400).json({
                error: "A valid non-negative price is required"
            });
        }
        if (
            quantity === undefined ||
            quantity === null ||
            quantity === "" ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0
        ) {
            return res.status(400).json({
                error: "A valid non-negative whole-number quantity is required"
            });
        }
        if (typeof description !== "string") {
            return res.status(400).json({
                error: "Description must be text"
            });
        }
        const result = db.prepare(`
            INSERT INTO products
            (product_name, category, price, quantity, description)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            product_name.trim(),
            category.trim(),
            Number(price),
            Number(quantity),
            description.trim()
        );
        const product = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(result.lastInsertRowid);
        return res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            error: "Failed to create product",
            details: error.message
        });
    }
});
// ==========================================
// PUT — UPDATE A PRODUCT
// ==========================================
app.put("/api/products/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: "A valid product ID is required"
            });
        }
        const {
            product_name,
            category,
            price,
            quantity,
            description = ""
        } = req.body || {};
        if (
            typeof product_name !== "string" ||
            !product_name.trim() ||
            typeof category !== "string" ||
            !category.trim() ||
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(Number(price)) ||
            Number(price) < 0 ||
            quantity === undefined ||
            quantity === null ||
            quantity === "" ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0 ||
            typeof description !== "string"
        ) {
            return res.status(400).json({
                error: "Valid product name, category, price and quantity are required"
            });
        }
        const result = db.prepare(`
            UPDATE products
            SET product_name = ?,
                category = ?,
                price = ?,
                quantity = ?,
                description = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            product_name.trim(),
            category.trim(),
            Number(price),
            Number(quantity),
            description.trim(),
            id
        );
        if (result.changes === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }
        const product = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(id);
        return res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            error: "Failed to update product",
            details: error.message
        });
    }
});
// ==========================================
// DELETE — DELETE A PRODUCT
// ==========================================
app.delete("/api/products/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: "A valid product ID is required"
            });
        }
        const result = db.prepare(
            "DELETE FROM products WHERE id = ?"
        ).run(id);
        if (result.changes === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }
        return res.status(200).json({
            message: "Product deleted successfully",
            id
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            error: "Failed to delete product"
        });
    }
});
// ==========================================
// HANDLE UNKNOWN ROUTES
// ==========================================
app.use((req, res) => {
    return res.status(404).json({
        error: "Route not found"
    });
});
// ==========================================
// HANDLE INVALID JSON AND OTHER ERRORS
// ==========================================
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            error: "Invalid JSON. Please check your request body."
        });
    }
    console.error("Unexpected server error:", err);
    return res.status(500).json({
        error: "Internal server error"
    });
});
// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(
        `DC INNOVATION API running at http://localhost:${PORT}`
    );
});