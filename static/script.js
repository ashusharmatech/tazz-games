let originalData = null; // Variable to store original puzzle data
let regionColors = {}; // Variable to store colors for regions

document.addEventListener("DOMContentLoaded", function () {
  // Function to handle cell clicks
  function toggleCell(event) {
    const cell = event.target;

    // Toggle between '', 'X', and 'O'
    if (cell.textContent === "") {
      cell.textContent = "X";
    } else if (cell.textContent === "X") {
      cell.textContent = "O";
    } else {
      cell.textContent = "";
    }
  }

  // Add click event listeners to all cells
  function addClickListeners() {
    const cells = document.querySelectorAll("td");
    cells.forEach((cell) => {
      cell.addEventListener("click", toggleCell);
    });
  }

  // Generate colors for regions
  function generateColors(numColors) {
    const colors = [];
    const hueIncrement = 360 / numColors;

    for (let i = 0; i < numColors; i++) {
      const hue = Math.floor(hueIncrement * i);
      colors.push(`hsl(${hue}, 70%, 80%)`); // Light pastel colors
    }

    return colors;
  }

  // Function to display the puzzle
  function displayPuzzle(data) {
    const container = document.getElementById("puzzle-container");
    container.innerHTML = ""; // Clear previous puzzle

    const table = document.createElement("table");
    const uniqueRegions = new Set();

    // Collect unique region IDs
    for (const [key, value] of Object.entries(data.cell_info)) {
      uniqueRegions.add(value);
    }

    const colors = generateColors(uniqueRegions.size);

    // Assign colors to regions
    uniqueRegions.forEach((region, index) => {
      regionColors[region] = colors[index];
    });

    // Create table rows and cells
    for (let i = 0; i < data.puzzle.length; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < data.puzzle[i].length; j++) {
        const cell = document.createElement("td");
        const regionId = data.cell_info[`(${i}, ${j})`];
        cell.textContent = ""; // Start with blank
        cell.style.backgroundColor = regionColors[regionId] || ""; // Apply region color
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    container.appendChild(table);
    addClickListeners(); // Add click listeners after creating the table
  }

  // Fetch puzzle and display it
  window.fetchPuzzle = function () {
    const size = 8; // Change this as needed
    if (!originalData) {
      // Only fetch if not already fetched
      fetch(`/generate_puzzle?size=${size}`)
        .then((response) => response.json())
        .then((data) => {
          originalData = data; // Store the original data
          displayPuzzle(data); // Display the puzzle
        })
        .catch((error) => console.error("Error fetching puzzle:", error));
    }
  };

  // Show the solution
  window.showSolution = function () {
    const solutionContainer = document.getElementById("solution-container");
    solutionContainer.innerHTML = ""; // Clear previous solution
    solutionContainer.style.display = "block"; // Show the solution container

    const table = document.createElement("table");

    // Create table rows and cells for the solution
    for (let i = 0; i < originalData.puzzle.length; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < originalData.puzzle[i].length; j++) {
        const cell = document.createElement("td");
        const regionId = originalData.cell_info[`(${i}, ${j})`];
        cell.style.backgroundColor = regionColors[regionId] || ""; // Apply region color

        cell.textContent = originalData.puzzle[i][j]; 
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    solutionContainer.appendChild(table);
  };
});
