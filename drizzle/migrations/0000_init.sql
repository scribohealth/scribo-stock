-- D1 / SQLite initial schema (apply with: wrangler d1 migrations apply DB --local | --remote)
CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stock_rows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`period_from` text NOT NULL,
	`period_to` text NOT NULL,
	`store_code` text NOT NULL,
	`store_name` text DEFAULT '' NOT NULL,
	`group_code` text DEFAULT '' NOT NULL,
	`group_name` text DEFAULT '' NOT NULL,
	`div_code` text DEFAULT '' NOT NULL,
	`div_name` text DEFAULT '' NOT NULL,
	`dpt_code` text DEFAULT '' NOT NULL,
	`dpt_name` text DEFAULT '' NOT NULL,
	`line_code` text DEFAULT '' NOT NULL,
	`line_name` text DEFAULT '' NOT NULL,
	`class_code` text DEFAULT '' NOT NULL,
	`class_name` text DEFAULT '' NOT NULL,
	`barcode` text NOT NULL,
	`product_name` text DEFAULT '' NOT NULL,
	`product_name_ja` text DEFAULT '' NOT NULL,
	`stock_qty` real DEFAULT 0 NOT NULL,
	`uploaded_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stock_rows_period_store_barcode_uidx` ON `stock_rows` (`period_from`,`period_to`,`store_code`,`barcode`);
