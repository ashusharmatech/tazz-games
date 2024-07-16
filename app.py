import random
from collections import deque
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

def print_matrices(N):
    def solve(row, cols, diag1, diag2, board, solutions):
        if row == N:
            solutions.append([row[:] for row in board])
            return
        for col in range(N):
            if (cols & (1 << col)) == 0 and (diag1 & (1 << (row - col + N - 1))) == 0 and (diag2 & (1 << (row + col))) == 0:
                board[row][col] = 'O'
                solve(row + 1, cols | (1 << col), diag1 | (1 << (row - col + N - 1)), diag2 | (1 << (row + col)), board, solutions)
                board[row][col] = 'X'  # Backtrack

    solutions = []
    board = [['X' for _ in range(N)] for _ in range(N)]
    solve(0, 0, 0, 0, board, solutions)
    return solutions

def get_random_puzzle(N):
    valid_matrices = print_matrices(N)
    if not valid_matrices:
        return None
    return random.choice(valid_matrices)

def create_matrix(N):
    return [[' ' for _ in range(N)] for _ in range(N)]

def is_valid(matrix, x, y):
    return 0 <= x < len(matrix) and 0 <= y < len(matrix[0]) and (matrix[x][y] == 'O' or matrix[x][y] == 'X')

def fill_region_around_o(matrix, o_pos, region_id, max_cells):
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    queue = deque([o_pos])
    cells_filled = 0

    while queue and cells_filled < max_cells:
        x, y = queue.popleft()
        if matrix[x][y] == 'O' or matrix[x][y] == 'X':
            matrix[x][y] = region_id
            cells_filled += 1

        random.shuffle(directions)  # Randomize the direction order
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if is_valid(matrix, nx, ny):
                queue.append((nx, ny))

def create_regions_around_os(matrix, N):
    region_count = 0
    max_cells_per_region = N  # Limit for how many cells can be filled for each region

    # Pre-generate random numbers for each 'O' region
    num_cells_to_fill_list = [random.randint(1, max_cells_per_region) for _ in range(N)]

    for x in range(N):
        for y in range(N):
            if matrix[x][y] == 'O':
                region_count += 1
                region_id = str(region_count)  # Unique ID for each region
                num_cells_to_fill = num_cells_to_fill_list[region_count - 1]  # Use pre-generated random number
                fill_region_around_o(matrix, (x, y), region_id, num_cells_to_fill)

    # Fill remaining empty cells with the nearest region ID
    for x in range(N):
        for y in range(N):
            if matrix[x][y] == 'X':
                nearest_region = None
                min_distance = float('inf')

                # Check adjacent cells for the nearest region
                for dx in range(-1, 2):
                    for dy in range(-1, 2):
                        if abs(dx) + abs(dy) == 1:  # Adjacent cells only
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < N and 0 <= ny < N and matrix[nx][ny] != 'X':
                                distance = abs(nx - x) + abs(ny - y)
                                if distance < min_distance:
                                    min_distance = distance
                                    nearest_region = matrix[nx][ny]

                if nearest_region is not None:
                    matrix[x][y] = nearest_region
                    # Optionally log the filling action
                    # print(f"Filled empty cell ({x}, {y}) with region ID {nearest_region}")

    return matrix

@app.route('/generate_puzzle', methods=['GET'])
def generate_puzzle():
    N = request.args.get('size', default=9, type=int)
    random_puzzle = get_random_puzzle(N)

    if not random_puzzle:
        return jsonify({"error": "No valid configurations found."}), 404

    region_matrix = create_matrix(N)
    for i in range(N):
        for j in range(N):
            region_matrix[i][j] = random_puzzle[i][j]

    regioned_matrix = create_regions_around_os(region_matrix, N)

    result = {
        "puzzle": random_puzzle,
        "regions": regioned_matrix,
    }

    # Prepare cell coordinates and their region
    cell_info = {}
    for x in range(N):
        for y in range(N):
            cell_info[f"({x}, {y})"] = regioned_matrix[x][y]  # Convert to string

    result['cell_info'] = cell_info
    return jsonify(result)


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
