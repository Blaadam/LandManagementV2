-- model ManagerTable {
--   Id                                            Int       @id @default(autoincrement())
--   Trello                                        String    @db.VarChar(35)
--   DiscordId                                     BigInt    
--   District                                      String    @db.VarChar(25)
--   AssignedAt                                    DateTime? @db.DateTime(0)
-- }

INSERT INTO ManagerTable (TrelloId, DiscordId, District, AssignedAt) VALUES
("5dee91fe39f2f13556c49380", 300654736162684929, "Arborfield", '2025-06-21 18:11:00'),
("60d8bf69c1d0a62288a9fa16", 501116633377538060, "Prominence", '2025-06-21 18:11:00');