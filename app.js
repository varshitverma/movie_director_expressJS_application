const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running....  :)");
    });
  } catch (err) {
    console.log(`Error ${err}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//movieTable
//GET Movies Names  API-1

// List only movies
const listOnlyMovieName = (object) => {
  return {
    movieName: object.movie_name,
  };
};

//API-1
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT movie_name
        FROM movie;`;
  const movieArray = await db.all(getMovieQuery);
  response.send(movieArray.map((eachmovie) => listOnlyMovieName(eachmovie)));
});

//API-2
//POST New Data in DB
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API-3
//Convert to Object
const convertMovieDBObject = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

//GET Movie Based on MovieID Requested
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT *
            FROM movie
        WHERE movie_id = ${movieId};`;
  const movieDetails = await db.get(getMovieQuery);
  response.send(convertMovieDBObject(movieDetails));
});

// API-4
//PUT Update the existing Data in DB
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE 
        movie_id=${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API-5
//DELETE Specific Movie In DB
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API-6
//directorTable

// Convert director details to object
const convertDirectorDBObject = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

//GET All the Directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT *
        FROM director;`;
  let directorsDetails = await db.all(getDirectorsQuery);
  response.send(
    directorsDetails.map((eachItem) => convertDirectorDBObject(eachItem))
  );
});

//API-7
//GET Directors Movie

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieNameQuery = `SELECT movie_name AS movieName
    FROM movie 
    WHERE director_id=${directorId};`;
  const directorMovie = await db.all(directorMovieNameQuery);
  response.send(directorMovie);
});

module.exports = app;
