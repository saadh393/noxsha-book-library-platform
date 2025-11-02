CREATE DATABASE IF NOT EXISTS `noxsha`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `noxsha`;

CREATE TABLE IF NOT EXISTS books (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2) DEFAULT NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 4.50,
  sales_count INT NOT NULL DEFAULT 0,
  description TEXT DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  image_storage_name VARCHAR(255) DEFAULT NULL,
  pdf_storage_name VARCHAR(255) DEFAULT NULL,
  pdf_original_name VARCHAR(255) DEFAULT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  is_bestseller TINYINT(1) NOT NULL DEFAULT 0,
  is_new TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS downloads (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  book_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_downloads_book (book_id),
  CONSTRAINT fk_downloads_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  book_id CHAR(36) NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  rating DECIMAL(3, 2) NOT NULL,
  comment TEXT NOT NULL,
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_book (book_id),
  CONSTRAINT fk_reviews_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS social_links (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  platform VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  icon_name VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_platform (platform)
);

CREATE TABLE IF NOT EXISTS nav_links (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  label VARCHAR(150) NOT NULL,
  href VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_label (label)
);

CREATE TABLE IF NOT EXISTS highlight_categories (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(150) NOT NULL,
  icon_name VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_name (name)
);

CREATE TABLE IF NOT EXISTS highlight_services (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(150) NOT NULL,
  description VARCHAR(255) NOT NULL,
  icon_name VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_title (title)
);

INSERT INTO books (title, author, price, old_price, rating, sales_count, category, is_bestseller, image_url, description)
VALUES
  ('Atomic Habits', 'James Clear', 32.00, 40.00, 4.80, 15420, 'Self-improvement', 1, 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg', 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Transform your life with tiny changes that lead to remarkable results.'),
  ('IKIGAI', 'Héctor García', 28.00, 35.00, 4.70, 12340, 'Self-improvement', 1, 'https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg', 'The Japanese secret to a long and happy life. Discover your reason for being and live with purpose.'),
  ('The Alchemist', 'Paulo Coelho', 25.00, 32.00, 4.90, 21540, 'Fiction', 1, 'https://images.pexels.com/photos/7504825/pexels-photo-7504825.jpeg', 'A magical tale about following your dreams. Journey with Santiago as he seeks his Personal Legend.'),
  ('Emotional Intelligence', 'Daniel Goleman', 32.00, NULL, 4.60, 8950, 'Psychology', 0, 'https://images.pexels.com/photos/8111764/pexels-photo-8111764.jpeg', 'Why it can matter more than IQ. Master your emotions and transform your relationships.'),
  ('How to Talk to Anyone', 'Leil Lowndes', 28.00, NULL, 4.50, 6230, 'Communication', 0, 'https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg', '92 little tricks for big success in relationships. Master the art of conversation and connection.'),
  ('Who Moved My Cheese?', 'Spencer Johnson', 22.00, NULL, 4.40, 9870, 'Business', 0, 'https://images.pexels.com/photos/7034720/pexels-photo-7034720.jpeg', 'An amazing way to deal with change in your work and life. A timeless business classic.'),
  ('The Psychology of Money', 'Morgan Housel', 30.00, NULL, 4.70, 11200, 'Finance', 0, 'https://images.pexels.com/photos/6772076/pexels-photo-6772076.jpeg', 'Timeless lessons on wealth, greed, and happiness. Understanding the psychology behind financial decisions.'),
  ('The 10X Rule', 'Grant Cardone', 35.00, 42.00, 4.60, 10450, 'Business', 1, 'https://images.pexels.com/photos/5632403/pexels-photo-5632403.jpeg', 'The only difference between success and failure. Take massive action to achieve extraordinary results.'),
  ('Rich Dad Poor Dad', 'Robert Kiyosaki', 32.00, 38.00, 4.80, 18920, 'Finance', 1, 'https://images.pexels.com/photos/8112173/pexels-photo-8112173.jpeg', 'What the rich teach their kids about money that the poor and middle class do not!'),
  ('How to Talk', 'Celeste Headlee', 35.00, NULL, 4.50, 5430, 'Communication', 0, 'https://images.pexels.com/photos/7034718/pexels-photo-7034718.jpeg', 'How to have better conversations. A guide to meaningful communication in the digital age.');

INSERT INTO site_settings (`key`, value, description)
VALUES
  ('hero_title', 'Find Your Next Book', 'Main hero title'),
  ('hero_subtitle', 'Discover a world where every page brings a new adventure. At Noxsha, we curate digital stories that inspire.', 'Main hero subtitle'),
  ('hero_button_label', 'Browse Now', 'Hero primary button text'),
  ('hero_highlights', '[{"author":"James Clear","label":"James Clear''s latest insights"},{"author":"Newsletter Vol","label":"Fresh newsletter editions"},{"author":"Robert Kiyosaki","label":"Money wisdom from Kiyosaki"},{"author":"Brian Tracy","label":"Productivity hacks by Brian Tracy"}]', 'Hero highlight line items in JSON'),
  ('header_logo_text', 'Noxsha', 'Header brand name'),
  ('header_search_placeholder', 'Search books by title or author...', 'Header search placeholder'),
  ('header_admin_tooltip', 'Admin Dashboard', 'Tooltip for admin icon'),
  ('home_search_title', 'Search Results', 'Headline shown on search results'),
  ('home_search_empty_title', 'No books found', 'Empty search headline'),
  ('home_search_empty_description', 'Try a different keyword to continue exploring our library.', 'Empty search helper text'),
  ('home_search_result_meta', 'books found', 'Suffix used in search result summary'),
  ('home_section_recommended_title', 'Recommended for you', 'Home section title'),
  ('home_section_recent_title', 'Recently added', 'Home recent section title'),
  ('home_section_bestseller_title', 'Most popular', 'Home bestseller section title'),
  ('home_section_popular_title', 'Popular this month', 'Home popular section title'),
  ('category_section_title', 'Categories', 'Category section title'),
  ('category_section_cta_label', 'View all', 'Category section button label'),
  ('services_section_title', 'Why readers love us', 'Services section title'),
  ('services_section_cta_label', 'Explore more', 'Services section button label'),
  ('footer_company_name', 'Noxsha', 'Footer company name'),
  ('footer_description', 'A digital library providing free access to curated e-books. Discover knowledge without barriers.', 'Footer company description'),
  ('footer_quick_links', '[{"label":"About us","href":"#about"},{"label":"E-books","href":"#ebook"},{"label":"Privacy Policy","href":"/privacy"},{"label":"Terms of use","href":"/terms"}]', 'Footer quick link items in JSON'),
  ('footer_contact_links', '[{"label":"Email: hello@noxsha.com","href":"mailto:hello@noxsha.com"},{"label":"Support: support@noxsha.com","href":"mailto:support@noxsha.com"}]', 'Footer contact info list in JSON'),
  ('footer_bottom_text', 'Copyright © 2025 Noxsha. All rights reserved.', 'Footer legal line'),
  ('downloads_form_description', 'Provide your information to access this free e-book instantly. We respect your privacy and never share your details.', 'Download form helper text'),
  ('downloads_success_message', 'Download ready! A secure link has been sent to your inbox if applicable.', 'Download success message')
ON DUPLICATE KEY UPDATE
  value = VALUES(value),
  description = VALUES(description);

INSERT INTO social_links (platform, url, icon_name, is_active)
VALUES
  ('Facebook', 'https://facebook.com', 'Facebook', 1),
  ('Instagram', 'https://instagram.com', 'Instagram', 1),
  ('Twitter', 'https://twitter.com', 'Twitter', 1)
ON DUPLICATE KEY UPDATE
  url = VALUES(url),
  icon_name = VALUES(icon_name),
  is_active = VALUES(is_active);

INSERT INTO nav_links (label, href, display_order)
VALUES
  ('Home', '/', 0),
  ('E-books', '#ebook', 1),
  ('About', '#about', 2)
ON DUPLICATE KEY UPDATE
  href = VALUES(href),
  display_order = VALUES(display_order);

INSERT INTO highlight_categories (name, icon_name, display_order)
VALUES
  ('History', 'BookOpen', 0),
  ('Children Corner', 'Users', 1),
  ('Science Fiction', 'Sparkles', 2),
  ('Self-improvement', 'TrendingUp', 3),
  ('Comics', 'Heart', 4)
ON DUPLICATE KEY UPDATE
  icon_name = VALUES(icon_name),
  display_order = VALUES(display_order);

INSERT INTO highlight_services (title, description, icon_name, display_order)
VALUES
  ('Instant access', 'Download instantly after grabbing your favourite title.', 'Package', 0),
  ('Always free', 'Absolutely no hidden costs or subscriptions required.', 'Shield', 1),
  ('24/7 support', 'Reach out any time you need help discovering books.', 'Headphones', 2),
  ('Multiple formats', 'Enjoy PDF, EPUB and more in a single click.', 'Truck', 3)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  icon_name = VALUES(icon_name),
  display_order = VALUES(display_order);

INSERT INTO admin_users (email, password_hash, name, is_active)
VALUES
  ('admin@noxsha.com', '$2b$10$7WvxskedZ53sSD7ua2DmFOx1iIOfZMneoL7A/16g7E1MCd.n7WBnG', 'Super Admin', 1)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  name = VALUES(name),
  is_active = VALUES(is_active);
