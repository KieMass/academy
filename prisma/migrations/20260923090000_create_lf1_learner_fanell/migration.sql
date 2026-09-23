-- Creates the single LF1 Study learner account (username "fanell") so it
-- exists in every environment without running a seed script.
--
-- The password hash below is for a random secret that was discarded, so
-- nobody can log in with it. Set a real password from the admin Users
-- screen ("Reset password"), then Fanell can change it under LF1 Study →
-- Settings. Skips cleanly if the username is already taken (e.g. the
-- account was created earlier by `npm run db:seed-lf1`).
INSERT INTO "User" ("id", "role", "username", "passwordHash", "createdAt", "updatedAt")
SELECT 'lf1-learner-fanell', 'LEARNER', 'fanell', '$2b$10$t9OdXkpSaXU9oR2Ls9PwrOkCsJKBfs.kguPi80nxSGD/r/GMkN0Ny', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "username" = 'fanell');

INSERT INTO "LearnerProfile" ("id", "userId", "displayName", "createdAt")
SELECT 'lf1-learner-profile-fanell', u."id", 'Fanell', CURRENT_TIMESTAMP
FROM "User" u
WHERE u."username" = 'fanell' AND u."role" = 'LEARNER'
  AND NOT EXISTS (SELECT 1 FROM "LearnerProfile" p WHERE p."userId" = u."id");
