-- Initialize all PostgreSQL databases for MCIA monorepo
-- Run automatically by postgres on first start via /docker-entrypoint-initdb.d/

CREATE DATABASE auth_db;
CREATE DATABASE registry_db;
CREATE DATABASE dependency_db;
CREATE DATABASE change_db;
CREATE DATABASE impact_db;
CREATE DATABASE notification_db;

-- Grant all privileges to the default user
GRANT ALL PRIVILEGES ON DATABASE auth_db TO "user";
GRANT ALL PRIVILEGES ON DATABASE registry_db TO "user";
GRANT ALL PRIVILEGES ON DATABASE dependency_db TO "user";
GRANT ALL PRIVILEGES ON DATABASE change_db TO "user";
GRANT ALL PRIVILEGES ON DATABASE impact_db TO "user";
GRANT ALL PRIVILEGES ON DATABASE notification_db TO "user";
