DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    city VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_orders_user_created_at ON orders(user_id, created_at);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
CREATE INDEX idx_products_category_id ON products(category_id);

INSERT INTO users (name, email, city, created_at) VALUES
('Alice Chen', 'alice@example.com', 'Taoyuan', '2026-08-01 09:00:00'),
('Bob Lin', 'bob@example.com', 'Taipei', '2026-08-01 10:00:00'),
('Carol Wang', 'carol@example.com', 'Taichung', '2026-08-02 11:00:00'),
('David Liu', 'david@example.com', 'Kaohsiung', '2026-08-02 12:00:00'),
('Eve Huang', 'eve@example.com', 'Tainan', '2026-08-03 13:00:00'),
('Frank Wu', 'frank@example.com', 'Hsinchu', '2026-08-03 14:00:00'),
('Grace Tsai', 'grace@example.com', 'Taoyuan', '2026-08-04 09:30:00'),
('Henry Kuo', 'henry@example.com', 'Taipei', '2026-08-04 10:30:00'),
('Ivy Hsu', 'ivy@example.com', 'Keelung', '2026-08-05 11:30:00'),
('Jack Peng', 'jack@example.com', 'Taichung', '2026-08-05 12:30:00');

INSERT INTO categories (name, created_at) VALUES
('Helmets', '2026-08-01 08:00:00'),
('Bluetooth Headsets', '2026-08-01 08:05:00'),
('Jackets', '2026-08-01 08:10:00'),
('Gloves', '2026-08-01 08:15:00');

INSERT INTO products (category_id, name, price, stock, created_at) VALUES
(1, 'Full Face Helmet A1', 4200.00, 15, '2026-08-01 09:00:00'),
(1, 'Modular Helmet M2', 6800.00, 10, '2026-08-01 09:10:00'),
(1, 'Open Face Helmet O3', 2500.00, 18, '2026-08-01 09:20:00'),
(2, 'Bluetooth Headset B1', 3200.00, 25, '2026-08-01 09:30:00'),
(2, 'Mesh Intercom X2', 5900.00, 12, '2026-08-01 09:40:00'),
(2, 'Single Rider Headset S3', 1800.00, 20, '2026-08-01 09:50:00'),
(3, 'Riding Jacket J1', 4500.00, 14, '2026-08-01 10:00:00'),
(3, 'Summer Jacket J2', 3600.00, 16, '2026-08-01 10:10:00'),
(4, 'Leather Gloves G1', 1200.00, 30, '2026-08-01 10:20:00'),
(4, 'Rain Gloves G2', 900.00, 28, '2026-08-01 10:30:00');

INSERT INTO orders (user_id, status, total_amount, created_at) VALUES
(1, 'paid', 7400.00, '2026-08-10 10:00:00'),
(2, 'paid', 3200.00, '2026-08-10 11:00:00'),
(1, 'shipped', 5700.00, '2026-08-11 09:30:00'),
(3, 'paid', 5400.00, '2026-08-11 14:00:00'),
(4, 'pending', 6800.00, '2026-08-12 15:00:00'),
(5, 'paid', 2100.00, '2026-08-12 16:20:00'),
(6, 'cancelled', 4500.00, '2026-08-13 13:10:00'),
(7, 'paid', 8400.00, '2026-08-13 17:45:00');

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 4200.00),
(1, 4, 1, 3200.00),
(2, 4, 1, 3200.00),
(3, 7, 1, 4500.00),
(3, 9, 1, 1200.00),
(4, 8, 1, 3600.00),
(4, 9, 1, 1200.00),
(4, 10, 2, 300.00),
(5, 2, 1, 6800.00),
(6, 6, 1, 1800.00),
(6, 10, 1, 300.00),
(7, 7, 1, 4500.00),
(8, 1, 1, 4200.00),
(8, 3, 1, 2500.00),
(8, 9, 1, 1200.00),
(8, 10, 1, 500.00);

UPDATE orders o
SET total_amount = sub.total
FROM (
    SELECT order_id, SUM(quantity * price) AS total
    FROM order_items
    GROUP BY order_id
) sub
WHERE o.id = sub.order_id;
