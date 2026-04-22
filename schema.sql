-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT NOT NULL,
    phone TEXT,
    profile_image TEXT,
    role TEXT DEFAULT 'USER', -- USER, BIZ, ADMIN, SUPER
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Churches table
CREATE TABLE IF NOT EXISTS churches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    address_detail TEXT,
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
    address_detail TEXT,
    phone TEXT,
    show_phone INTEGER DEFAULT 1, -- 전화번호 노출 여부 (0: 숨김, 1: 노출)
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

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Menus table
CREATE TABLE IF NOT EXISTS menus (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price TEXT, -- Storing as text for flexibility (e.g., "15,000원")
    description TEXT,
    image_key TEXT,
    is_recommended INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);
