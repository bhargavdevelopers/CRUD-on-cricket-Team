const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role
  };
};

// Get players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const playerArray = await db.all(getPlayersQuery);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Post Player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId, playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_id, player_name, jersey_number, role)
    VALUES
      (
        ${playerId},
         '${playerName}',
         ${jerseyNumber},
         '${role}'
      );`;
  const dbResponse = await db.run(addPlayerQuery);
  const id = dbResponse.lastID;
  response.send("Player Added to Team");
});

//Get Player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      player_id as playerId,
      player_name as playerName,
      jersey_number as jerseyNumber,
      role as role
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

//Update player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { player_id, playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}'
    WHERE
      player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete player API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
