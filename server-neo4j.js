// server.js
const express = require("express");
const neo4j = require("neo4j-driver");
const app = express();
const port = 3000;
const cors = require("cors");

// Configura CORS
app.use(cors());

const URL_DB = `neo4j+s://8fb721a1.databases.neo4j.io`;
const USER_DB = `neo4j`;
const PASS_DB = `P4geB7xYUpDyiIOCKYx0s61FPC68vmsTrpOltQ_Csz0`;
// Crea una instancia del driver, especificando la URL de tu base de datos y las credenciales
const driver = neo4j.driver(
  URL_DB, // URL de la base de datos
  neo4j.auth.basic(USER_DB, PASS_DB) // Usuario y contraseña
);

// Ruta para obtener datos de películas
app.get("/movies", async (req, res) => {
  const session = driver.session();
  const movieTitle = req.query.movie || "";
  // console.log(movieTitle);

  try {
    const queryNeo4j = `MATCH p=((g:Genre)<-[*]-(m:Pelicula where m.title =~ "(?i).*${movieTitle}.*")<-[*]-(u:Usuario)) RETURN p`;
    const result = await session.run(queryNeo4j);
    const nodes = [];
    const edges = [];
    const nodeSet = new Set();

    result.records.forEach((record) => {
      const path = record.get("p");

      path.segments.forEach((segment) => {
        const startNode = segment.start;
        const endNode = segment.end;
        const relationship = segment.relationship;

        if (!nodeSet.has(startNode.identity.toString())) {
          nodes.push({
            data: {
              id: startNode.identity.toString(),
              label: startNode.labels.includes("Pelicula")
                ? startNode.properties.title
                : startNode.labels.includes("Genre")
                ? startNode.properties.name
                : startNode.properties.descripcion,
              type: startNode.labels[0],
            },
          });
          nodeSet.add(startNode.identity.toString());
        }

        if (!nodeSet.has(endNode.identity.toString())) {
          nodes.push({
            data: {
              id: endNode.identity.toString(),
              label: endNode.labels.includes("Pelicula")
                ? endNode.properties.title
                : endNode.labels.includes("Genre")
                ? endNode.properties.name
                : endNode.properties.descripcion,
              type: endNode.labels[0],
            },
          });
          nodeSet.add(endNode.identity.toString());
        }

        edges.push({
          data: {
            id: relationship.identity.toString(),
            source: startNode.identity.toString(),
            target: endNode.identity.toString(),
            label: relationship.type,
          },
        });
      });
    });

    res.json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

/*   // Ruta para verificar la conexión
app.get('/verify-connection', async (req, res) => {
    const session = driver.session();
    
    try {
      const result = await session.run('MATCH (n:Pelicula) RETURN n LIMIT 10');
      if (result.records.length > 0) {
        console.log(result.records.length);
        res.json({ message: 'Conexión exitosa a Neo4j' });
      } else {
        res.json({ message: 'No se pudo conectar a Neo4j' });
      }
    } catch (error) {
      res.json({ message: 'Error al conectar a Neo4j', error: error.message });
    } finally {
      await session.close();
    }
  }); */

// Sirve el archivo HTML
app.use(express.static("public"));

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
