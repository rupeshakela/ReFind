
DROP DATABASE IF EXISTS PRODUCT;
CREATE DATABASE IF NOT EXISTS product;
USE PRODUCT;
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    image VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    seller_name VARCHAR(100) NOT NULL
);

INSERT INTO products (image, description, price, seller_name)
VALUES
SELECT * FROM products;
