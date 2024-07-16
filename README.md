# Tazz

This project is a Flask-based web application that generates unique puzzle games. Each puzzle consists of a grid with 'O' and 'X' cells, where 'O' cells are part of the solution and are not visible to the user. The regions around 'O' cells are uniquely defined to ensure that there is only one valid solution for each puzzle.

## Features

- **Unique Puzzle Generation**: Ensures that each generated puzzle has only one valid solution.
- **Dynamic Region Creation**: Dynamically fills regions around 'O' cells to define the puzzle.
- **API Endpoint**: Provides an API endpoint to generate puzzles of different sizes.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ashusharmatech/tazz-games.git
   cd puzzle-game-generator
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```bash
   pip install Flask
   ```

## Usage

1. Run the Flask application:
   ```bash
   python app.py
   ```

2. Access the application in your web browser at:
   ```
   http://127.0.0.1:5000
   ```

3. Generate puzzles by navigating to:
   ```
   http://127.0.0.1:5000/generate_puzzle?size=N
   ```
   Replace `N` with the desired puzzle size (e.g., `9`).

## API

### Generate Puzzle

- **Endpoint**: `/generate_puzzle`
- **Method**: GET
- **Parameters**:
  - `size` (optional): The size of the puzzle grid (default is `9`).

- **Response**:
  - `puzzle`: Original matrix with 'O' and 'X'.
  - `regions`: Matrix with region IDs filled around 'O'.
  - `cell_info`: Dictionary with coordinates and corresponding region ID.

### Example Response

```json
{
  "puzzle": [
    ["X", "X", "X", ...],
    ["X", "O", "X", ...],
    ...
  ],
  "regions": [
    ["1", "1", "2", ...],
    ["1", "O", "2", ...],
    ...
  ],
  "cell_info": {
    "(0, 0)": "1",
    "(0, 1)": "1",
    ...
  }
}
```

## Files

- `app.py`: Main application file containing the Flask app and puzzle generation logic.

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b my-feature-branch`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-feature-branch`
5. Submit a pull request.

## License

This project is licensed under the MIT License.
```

Copy and paste the above content into a `README.md` file in your project directory.