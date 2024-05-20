const URL_BASE = `http://localhost:3000`;
/* 
    --------------------------------------------------------------
    -----------------Tabla y dibujar grafos de peliculas-----------------------
    --------------------------------------------------------------
    */
document.addEventListener("DOMContentLoaded", async () => {
  // Botones de búsqueda
  const searchButton = document.getElementById("searchButton");

  // Mostrar el numero de peliculas
  const contarPeliculas = document.getElementById("contarPeliculas");

  // Tabla película
  const moviesTableBody = document.getElementById("moviesTableBody");

  // Progress bar para su procesamiento mediante acciones de ejecución
  const progress = document.getElementById("progress");

  searchButton.addEventListener("click", async () => {
    // Mostrar barra de progreso
    progress.style.display = "block";
    const paramTitulo = document.getElementById("movieInput").value;
    await fetchMoviesAndGraph(paramTitulo);
  });

  // Obtener datos del gráfico inicialmente
  displayNoRecordsMessage();

  async function fetchMoviesAndGraph(paramTitulo = "") {
    try {
      // solicitud asincrónica a un punto final de URL especificado `/movies` con un parámetro de consulta `movie`
      const response = await fetch(
        `${URL_BASE}/movies?movie=${encodeURIComponent(paramTitulo)}`
      );
      const movies = await response.json();

      console.log({ movies });

      // Limpiar la tabla
      moviesTableBody.innerHTML = "";

      // Listar los registros de tipo "Pelicula"
      let pelicula = movies.nodes.filter(
        (peli) => peli.data.type === "Pelicula"
      );

      // Si no hay registros se mostrará el mensaje en la tabla "No hay registros"
      if (pelicula.length === 0) {
        displayNoRecordsMessage();
      }

      // console.log("solo_peliculas: ", pelicula);

      // Actualizar el label con el número de películas
      contarPeliculas.textContent = `${
        pelicula.length === 0 ? "" : `${pelicula.length} película(s)`
      } `;

      // Creación de la tabla de peliculas y sus botones
      pelicula.forEach((movie) => {
        const row = document.createElement("tr");
        const titleCell = document.createElement("td");
        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        const icon = document.createElement("i");

        titleCell.textContent = movie.data.label || "N/A";
        button.classList.add(
          "btn",
          "waves-effect",
          "waves-light",
          "blue",
          // "tooltipped"
        );
        button.setAttribute("data-tooltip", "Mostrar grafo");
        icon.classList.add("material-icons");
        icon.textContent = "hub"; // Ícono de visibilidad

        button.appendChild(icon);
        button.addEventListener("click", async () => {
          const titulo = movie.data.label;
          const titulolimpio = titulo.replace(/\s*\(.*?\)\s*$/, "");
          await fetchGraphData(titulolimpio);
        });

        actionCell.appendChild(button);
        row.appendChild(titleCell);
        row.appendChild(actionCell);
        moviesTableBody.appendChild(row);
      });

      // Inicializar tooltips de Materialize
      const tooltips = document.querySelectorAll(".tooltipped");
      M.Tooltip.init(tooltips);

      const elements = [...movies.nodes, ...movies.edges];

      // Inicializar Cytoscape con datos completos inicialmente
      initCytoscape(elements);
    } catch (error) {
      console.error("Error al obtener las películas:", error);
    } finally {
      // Ocultar barra de progreso
      progress.style.display = "none";
    }
  }

  // Metodo para mostrar la tabla sin registros de peliculas
  function displayNoRecordsMessage() {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 2;
    cell.textContent = "No hay registros";
    cell.style.textAlign = "center";
    row.appendChild(cell);
    moviesTableBody.appendChild(row);
  }

  async function fetchGraphData(paramTitulo) {
    try {
      // Mostrar barra de progreso
      progress.style.display = "block";

      // solicitud asincrónica a un punto final de URL especificado `/movies` con un parámetro de consulta `movie`
      const response = await fetch(
        `${URL_BASE}/movies?movie=${encodeURIComponent(paramTitulo)}`
      );
      const movies = await response.json();

      // Asignar los nodos y relaciones en la constante "elements"
      const elements = [...movies.nodes, ...movies.edges];

      // Actualizar Cytoscape con los nuevos datos del grafo
      initCytoscape(elements);
    } catch (error) {
      console.error("Error al obtener los datos del grafo:", error);
    } finally {
      // Ocultar barra de progreso
      progress.style.display = "none";
    }
  }

  // Inicializar Cytoscape
  function initCytoscape(graphData) {
    const cy = cytoscape({
      container: document.getElementById("cy"),
      elements: graphData,
      style: [
        {
          selector: "node",
          style: {
            "background-color": function (ele) {
              if (ele.data("type") === "Usuario") return "#F0A30A"; // Color amarillo
              if (ele.data("type") === "Pelicula") return "#60A917"; // Color verde
              if (ele.data("type") === "Genre") return "#1BA1E2"; // Color celeste
              return "#CCCCCC"; // Default color for other types
            },
            label: "data(label)",
            shape: "ellipse", // Mantener la forma de círculo
            "text-wrap": "wrap", // Envolver texto
            "text-max-width": "80px", // Máximo ancho del texto dentro del nodo
            "text-valign": "center",
            "text-halign": "center",
            color: "#fff",
            "font-size": "12px",
            height: "80px", // Altura fija del nodo
            width: "80px", // Ancho fijo del nodo
          },
        },
        {
          selector: "edge",
          style: {
            width: 10,
            "target-arrow-shape": "triangle", // Forma de la flecha
            // 'curve-style': 'bezier', // Curva Bezier para las aristas
            label: "data(label)",
            "font-size": "10px",
            "text-rotation": "autorotate",
            "text-margin-y": -10,
            "line-color": "#FAE6B4",
            "target-arrow-color": "#FAE6B4",
          },
        },
      ],
      layout: {
        name: "cose",
        idealEdgeLength: 100,
        nodeOverlap: 20,
      },
    });
  }
});
