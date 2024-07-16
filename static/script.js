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
    validateSolution();
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

  function fetchPuzzle() {
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

  function validateSolution() {
    // Perform validation and get cells to highlight
    const { isValid, cellsToHighlight } = validateRules();
  
    // Highlight invalid cells
    highlightCells(cellsToHighlight);
  
    // Update the validation label
    const validationLabel = document.getElementById("validation-label");
    if (isValid) {
      validationLabel.textContent = "Success! Your solution is valid.";
      validationLabel.style.color = "green";
    } else {
      validationLabel.textContent = "Error: Your solution is invalid.";
      validationLabel.style.color = "red";
    }
  }

  function highlightCells(cellsToHighlight) {
    const puzzleTable = document
      .getElementById("puzzle-container")
      .getElementsByTagName("table")[0];
    const puzzleRows = puzzleTable.rows;
  
    // Reset all cells to default style
    for (let i = 0; i < puzzleRows.length; i++) {
      for (let j = 0; j < puzzleRows[i].cells.length; j++) {
        puzzleRows[i].cells[j].style.backgroundImage = ""; // Reset background image
      }
    }
  
    // Apply highlights to specified cells with small diagonal lines
    cellsToHighlight.forEach(([i, j]) => {
      puzzleRows[i].cells[j].style.backgroundImage = "repeating-linear-gradient(45deg, red, red 1px, transparent 1px, transparent 3px)";
    });
  }

  function validateRules() {
    const puzzleTable = document
      .getElementById("puzzle-container")
      .getElementsByTagName("table")[0];
    const puzzleRows = puzzleTable.rows;
    const puzzleSize = puzzleRows.length;
    const regionCounts = {};
    const rowCounts = new Array(puzzleSize).fill(0);
    const colCounts = new Array(puzzleSize).fill(0);
    const cellsToHighlight = [];
    let allOsPlaced = true;
  
    // Check for each region and count 'O's in rows and columns
    for (let i = 0; i < puzzleSize; i++) {
      for (let j = 0; j < puzzleSize; j++) {
        const cell = puzzleRows[i].cells[j];
        const regionId = originalData.cell_info[`(${i}, ${j})`];
        const cellValue = cell.textContent;
  
        if (cellValue === "O") {
          // Check for region constraints
          if (!regionCounts[regionId]) {
            regionCounts[regionId] = 0;
          }
          regionCounts[regionId]++;
          rowCounts[i]++;
          colCounts[j]++;
  
          // Check for diagonal constraints
          const diagonals = [
            [i - 1, j - 1],
            [i - 1, j + 1],
            [i + 1, j - 1],
            [i + 1, j + 1],
          ];
          for (const [di, dj] of diagonals) {
            if (
              di >= 0 &&
              di < puzzleSize &&
              dj >= 0 &&
              dj < puzzleSize &&
              puzzleRows[di].cells[dj].textContent === "O"
            ) {
              cellsToHighlight.push([i, j]); // Add current cell to highlight list
              cellsToHighlight.push([di, dj]); // Add diagonal cell to highlight list
            }
          }
        } else if (cellValue !== "O" && cellValue !== "") {
          allOsPlaced = false;
        }
      }
    }
  
    // Check if each region has exactly one 'O'
    for (const regionId in regionCounts) {
      if (regionCounts[regionId] !== 1) {
        // Find cells in the region and highlight them
        for (let i = 0; i < puzzleSize; i++) {
          for (let j = 0; j < puzzleSize; j++) {
            const regionCheckId = originalData.cell_info[`(${i}, ${j})`];
            if (regionCheckId === regionId && puzzleRows[i].cells[j].textContent === "O") {
              cellsToHighlight.push([i, j]);
            }
          }
        }
        allOsPlaced = false;
      }
    }
  
    // Check if each row and column has exactly one 'O'
    for (let i = 0; i < puzzleSize; i++) {
      if (rowCounts[i] !== 1) {
        // Highlight cells in the row
        for (let j = 0; j < puzzleSize; j++) {
          if (puzzleRows[i].cells[j].textContent === "O") {
            cellsToHighlight.push([i, j]);
          }
        }
        allOsPlaced = false;
      }
      if (colCounts[i] !== 1) {
        // Highlight cells in the column
        for (let j = 0; j < puzzleSize; j++) {
          if (puzzleRows[j].cells[i].textContent === "O") {
            cellsToHighlight.push([j, i]);
          }
        }
        allOsPlaced = false;
      }
    }
  
    // If all 'O's are not placed, the solution is invalid
    if (!allOsPlaced) {
      return { isValid: false, cellsToHighlight };
    }
  
    // Check if there are any cells to highlight
    const isValid = cellsToHighlight.length === 0;
    return { isValid, cellsToHighlight };
  }

  function showSolution() {
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
  }

  // Fetch puzzle and display it
  window.fetchPuzzle = fetchPuzzle;
  // Show the solution
  window.showSolution = showSolution;
});
