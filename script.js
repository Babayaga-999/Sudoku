const sudokuDiv = document.getElementById("sudoku");
const timerElement = document.getElementById("timer");
const difficultySelect = document.getElementById("difficulty");
let timerInterval, seconds = 0;

function startTimer() {
    stopTimer(); 
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        let min = String(Math.floor(seconds / 60)).padStart(2, "0");
        let sec = String(seconds % 60).padStart(2, "0");
        timerElement.textContent = `${min}:${sec}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function generateSudoku(difficulty) {
    sudokuDiv.innerHTML = ""; 
    startTimer();
    highlightSameNumbers(null);


    const baseBoard = [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
    ];

    let removeCount = difficulty === "easy" ? 30 : difficulty === "medium" ? 45 : 55;

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let input = document.createElement("input");
            input.maxLength = 1;

            if (Math.random() > removeCount / 81) {
                input.value = baseBoard[i][j];
                input.disabled = true;
                input.style.backgroundColor = "#f0f0f0";
            }

            input.addEventListener("input", () => {
              input.value = input.value.replace(/[^1-9]/g, ""); 
              highlightSameNumbers(input.value);
              checkCompletion(baseBoard);
            });
            
            input.addEventListener("click", () => {
              if (input.value) {
                highlightSameNumbers(input.value);
              } else {
                highlightSameNumbers(null);
              }
            });


            sudokuDiv.appendChild(input);
        }
    }
}

function checkCompletion(solution) {
    const cells = document.querySelectorAll("#sudoku input");
    for (let i = 0; i < 81; i++) {
        if (cells[i].value != solution[Math.floor(i/9)][i%9]) return;
    }
    stopTimer();
    alert("🎉 Congratulations! You solved the Sudoku!");
}

function highlightSameNumbers(number) {
    const cells = document.querySelectorAll("#sudoku input");

    cells.forEach(cell => {
        cell.classList.remove("highlight");
        if (number && cell.value == number) {
            cell.classList.add("highlight");
        }
    });
}

document.getElementById("checkBtn").addEventListener("click", () => {
    stopTimer();
    alert("⏸ Timer stopped! Click difficulty to play again.");
});

difficultySelect.addEventListener("change", () => {
    generateSudoku(difficultySelect.value);
});

generateSudoku("easy");
