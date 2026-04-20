-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'USER', -- USER, BIZ, ADMIN, SUPER
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Churches table
CREATE TABLE IF NOT EXISTS churches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    manager_name TEXT,
    manager_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    church_id TEXT,
    biz_no TEXT UNIQUE NOT NULL, -- 사업자등록번호 (Unique)
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    images JSON, -- Store R2 image keys as a JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (church_id) REFERENCES churches(id)
);

-- Bookmarks (Wishlist) table
CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    business_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    UNIQUE(user_id, business_id)
);
