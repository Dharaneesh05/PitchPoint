PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_api_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`cache_key` text NOT NULL,
	`data` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_api_cache`("id", "cache_key", "data", "expires_at", "created_at") SELECT "id", "cache_key", "data", "expires_at", "created_at" FROM `api_cache`;--> statement-breakpoint
DROP TABLE `api_cache`;--> statement-breakpoint
ALTER TABLE `__new_api_cache` RENAME TO `api_cache`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `api_cache_cache_key_unique` ON `api_cache` (`cache_key`);--> statement-breakpoint
CREATE TABLE `__new_matches` (
	`id` text PRIMARY KEY NOT NULL,
	`team1_id` text NOT NULL,
	`team2_id` text NOT NULL,
	`venue_id` text,
	`format` text NOT NULL,
	`status` text DEFAULT 'upcoming',
	`scheduled_at` integer NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`team1_score` text,
	`team2_score` text,
	`result` text,
	`winner_id` text,
	`external_match_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`team1_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team2_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_matches`("id", "team1_id", "team2_id", "venue_id", "format", "status", "scheduled_at", "started_at", "completed_at", "team1_score", "team2_score", "result", "winner_id", "external_match_id", "created_at") SELECT "id", "team1_id", "team2_id", "venue_id", "format", "status", "scheduled_at", "started_at", "completed_at", "team1_score", "team2_score", "result", "winner_id", "external_match_id", "created_at" FROM `matches`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
ALTER TABLE `__new_matches` RENAME TO `matches`;--> statement-breakpoint
CREATE TABLE `__new_player_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`match_id` text,
	`season` text,
	`matches` integer DEFAULT 0,
	`runs` integer DEFAULT 0,
	`wickets` integer DEFAULT 0,
	`average` real DEFAULT 0,
	`strike_rate` real DEFAULT 0,
	`economy` real DEFAULT 0,
	`fifties` integer DEFAULT 0,
	`hundreds` integer DEFAULT 0,
	`catches` integer DEFAULT 0,
	`stumps` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_player_stats`("id", "player_id", "match_id", "season", "matches", "runs", "wickets", "average", "strike_rate", "economy", "fifties", "hundreds", "catches", "stumps", "created_at", "updated_at") SELECT "id", "player_id", "match_id", "season", "matches", "runs", "wickets", "average", "strike_rate", "economy", "fifties", "hundreds", "catches", "stumps", "created_at", "updated_at" FROM `player_stats`;--> statement-breakpoint
DROP TABLE `player_stats`;--> statement-breakpoint
ALTER TABLE `__new_player_stats` RENAME TO `player_stats`;--> statement-breakpoint
CREATE TABLE `__new_players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`team_id` text,
	`role` text NOT NULL,
	`batting_style` text,
	`bowling_style` text,
	`image` text,
	`date_of_birth` integer,
	`nationality` text,
	`is_injured` integer DEFAULT false,
	`form` text DEFAULT 'average',
	`created_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_players`("id", "name", "team_id", "role", "batting_style", "bowling_style", "image", "date_of_birth", "nationality", "is_injured", "form", "created_at") SELECT "id", "name", "team_id", "role", "batting_style", "bowling_style", "image", "date_of_birth", "nationality", "is_injured", "form", "created_at" FROM `players`;--> statement-breakpoint
DROP TABLE `players`;--> statement-breakpoint
ALTER TABLE `__new_players` RENAME TO `players`;--> statement-breakpoint
CREATE TABLE `__new_predictions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`match_id` text NOT NULL,
	`predicted_winner_id` text NOT NULL,
	`confidence` integer,
	`points` integer DEFAULT 0,
	`is_correct` integer,
	`prediction_data` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`predicted_winner_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_predictions`("id", "user_id", "match_id", "predicted_winner_id", "confidence", "points", "is_correct", "prediction_data", "created_at") SELECT "id", "user_id", "match_id", "predicted_winner_id", "confidence", "points", "is_correct", "prediction_data", "created_at" FROM `predictions`;--> statement-breakpoint
DROP TABLE `predictions`;--> statement-breakpoint
ALTER TABLE `__new_predictions` RENAME TO `predictions`;--> statement-breakpoint
CREATE UNIQUE INDEX `predictions_user_id_match_id_unique` ON `predictions` (`user_id`,`match_id`);--> statement-breakpoint
CREATE TABLE `__new_saved_analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`analysis_type` text NOT NULL,
	`analysis_data` text NOT NULL,
	`match_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_saved_analyses`("id", "user_id", "title", "description", "analysis_type", "analysis_data", "match_id", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "analysis_type", "analysis_data", "match_id", "created_at", "updated_at" FROM `saved_analyses`;--> statement-breakpoint
DROP TABLE `saved_analyses`;--> statement-breakpoint
ALTER TABLE `__new_saved_analyses` RENAME TO `saved_analyses`;--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`country` text NOT NULL,
	`logo` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_teams`("id", "name", "short_name", "country", "logo", "created_at") SELECT "id", "name", "short_name", "country", "logo", "created_at" FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
CREATE UNIQUE INDEX `teams_name_unique` ON `teams` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_short_name_unique` ON `teams` (`short_name`);--> statement-breakpoint
CREATE TABLE `__new_user_favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`player_id` text,
	`team_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_favorites`("id", "user_id", "player_id", "team_id", "created_at") SELECT "id", "user_id", "player_id", "team_id", "created_at" FROM `user_favorites`;--> statement-breakpoint
DROP TABLE `user_favorites`;--> statement-breakpoint
ALTER TABLE `__new_user_favorites` RENAME TO `user_favorites`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'fan' NOT NULL,
	`profile_image` text,
	`email_verified` integer DEFAULT false,
	`email_verification_token` text,
	`email_verification_expires` integer,
	`password_reset_token` text,
	`password_reset_expires` integer,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "email", "password", "role", "profile_image", "email_verified", "email_verification_token", "email_verification_expires", "password_reset_token", "password_reset_expires", "last_login_at", "created_at", "updated_at") SELECT "id", "username", "email", "password", "role", "profile_image", "email_verified", "email_verification_token", "email_verification_expires", "password_reset_token", "password_reset_expires", "last_login_at", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `__new_venues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`country` text NOT NULL,
	`capacity` integer,
	`pitch_type` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_venues`("id", "name", "city", "country", "capacity", "pitch_type", "created_at") SELECT "id", "name", "city", "country", "capacity", "pitch_type", "created_at" FROM `venues`;--> statement-breakpoint
DROP TABLE `venues`;--> statement-breakpoint
ALTER TABLE `__new_venues` RENAME TO `venues`;