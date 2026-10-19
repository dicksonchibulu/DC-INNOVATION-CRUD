CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'HP EliteBook', 'Laptop', 8500, 5, 'Business laptop'
WHERE NOT EXISTS (SELECT 1 FROM products);

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'iPhone 12 Pro Max', 'Smartphone', 9500, 8, 'Apple smartphone'
WHERE (SELECT COUNT(*) FROM products) = 1;

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'Samsung Galaxy S24', 'Smartphone', 12000, 4, 'Samsung smartphone'
WHERE (SELECT COUNT(*) FROM products) = 2;

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'Dell Latitude', 'Laptop', 7800, 6, 'Professional laptop'
WHERE (SELECT COUNT(*) FROM products) = 3;

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'Logitech Mouse', 'Accessories', 250, 20, 'Wireless mouse'
WHERE (SELECT COUNT(*) FROM products) = 4;

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'Mechanical Keyboard', 'Accessories', 650, 10, 'Mechanical keyboard'
WHERE (SELECT COUNT(*) FROM products) = 5;

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'HP Monitor', 'Monitor', 2200, 7, 'Full HD monitor'
WHERE (SELECT COUNT(*) FROM products) = 6;

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'USB Flash Drive', 'Storage', 180, 25, '64GB flash drive'
WHERE (SELECT COUNT(*) FROM products) = 7;

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'External SSD', 'Storage', 1500, 9, 'Portable SSD'
WHERE (SELECT COUNT(*) FROM products) = 8;

INSERT INTO products
(product_name, category, price, quantity, description)
SELECT 'Bluetooth Headphones', 'Audio', 800, 12, 'Wireless headphones'
WHERE (SELECT COUNT(*) FROM products) = 9;