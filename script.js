/* Simple Sudoku generator + solver + UI */

/* Helpers */
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

function deepCopy(board){ return board.map(r=>r.slice()); }

/* Board utilities */
function isSafe(board, row, col, num){
  for(let x=0;x<9;x++) if(board[row][x]===num) return false;
  for(let x=0;x<9;x++) if(board[x][col]===num) return false;
  const startRow = row - row%3, startCol = col - col%3;
  for(let r=0;r<3;r++) for(let c=0;c<3;c++) if(board[startRow+r][startCol+c]===num) return false;
  return true;
}

/* Backtracking filler for a completed board */
function fillBoard(board){
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(board[r][c]===0){
        let nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for(let n of nums){
          if(isSafe(board,r,c,n)){
            board[r][c]=n;
            if(fillBoard(board)) return true;
            board[r][c]=0;
          }
        }
        return false;
      }
    }
  }
  return true; // solved
}

/* Solver that counts solutions up to limit (used to ensure uniqueness) */
function countSolutions(board, limit=2){
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(board[r][c]===0){
        let count=0;
        for(let n=1;n<=9;n++){
          if(isSafe(board,r,c,n)){
            board[r][c]=n;
            count += countSolutions(board, limit);
            if(count>=limit){ board[r][c]=0; return count; }
            board[r][c]=0;
          }
        }
        return count;
      }
    }
  }
  return 1; // reached full solution
}

/* Make puzzle by removing cells while checking uniqueness */
function makePuzzle(fullBoard, removals){
  let puzzle = deepCopy(fullBoard);
  let attempts = removals*3;
  while(removals>0 && attempts>0){
    let r = Math.floor(Math.random()*9);
    let c = Math.floor(Math.random()*9);
    if(puzzle[r][c]===0){ attempts--; continue; }
    let backup = puzzle[r][c];
    puzzle[r][c]=0;
    // ensure still has unique solution
    let copy = deepCopy(puzzle);
    let sols = countSolutions(copy, 2);
    if(sols!==1){
      puzzle[r][c]=backup; // revert
      attempts--;
    } else {
      removals--;
    }
  }
  return puzzle;
}

/* Difficulty -> number of removals */
const difficultyMap = { easy:36, medium:48, hard:54 };

/* Rendering UI */
const boardEl = document.getElementById('board');
const newBtn = document.getElementById('newBtn');
const checkBtn = document.getElementById('checkBtn');
const solveBtn = document.getElementById('solveBtn');
const difficultyEl = document.getElementById('difficulty');
const messageEl = document.getElementById('message');
const publishGuideBtn = document.getElementById('publishGuide');

let solvedBoard = null;
let puzzleBoard = null;
let givenMask = null;

function render(board, given){
  boardEl.innerHTML='';
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const cell = document.createElement('div');
      cell.className='cell';
      if(c===2||c===5) cell.classList.add('col-2');
      if(r===2||r===5) cell.classList.add('row-2');
      if(given[r][c]){
        cell.classList.add('given');
        cell.textContent = board[r][c];
      } else {
        const inp = document.createElement('input');
        inp.type='text';
        inp.maxLength=1;
        inp.dataset.r = r; inp.dataset.c = c;
        inp.value = board[r][c]===0?'':board[r][c];
        inp.addEventListener('input', onInput);
        inp.addEventListener('keydown', (e)=> {
          if(e.key==='Backspace' || e.key==='Delete') inp.value='';
          if(/\D/.test(e.key) && e.key.length===1) e.preventDefault();
        });
        cell.appendChild(inp);
      }
      boardEl.appendChild(cell);
    }
  }
}

function onInput(e){
  const r = +e.target.dataset.r, c = +e.target.dataset.c;
  let val = e.target.value.trim();
  if(val==='' ){ puzzleBoard[r][c]=0; return; }
  val = parseInt(val);
  if(isNaN(val) || val<1 || val>9){ e.target.value=''; puzzleBoard[r][c]=0; return; }
  puzzleBoard[r][c]=val;
}

/* Create new game */
function newGame(){
  messageEl.textContent = 'Generating... this may take a few seconds on first runs.';
  setTimeout(()=>{ // let UI update
    let empty = Array.from({length:9},()=>Array(9).fill(0));
    fillBoard(empty);
    solvedBoard = deepCopy(empty);
    const diff = difficultyEl.value;
    puzzleBoard = makePuzzle(solvedBoard, difficultyMap[diff]);
    givenMask = puzzleBoard.map(r => r.map(c => c!==0));
    render(puzzleBoard, givenMask);
    messageEl.textContent = 'New puzzle ready — difficulty: '+diff;
  },10);
}

/* Check user's board against solvedBoard */
function checkSolution(){
  if(!solvedBoard) return;
  for(let r=0;r<9;r++) for(let c=0;c<9;c++){
    const val = puzzleBoard[r][c];
    if(val===0 || val!==solvedBoard[r][c]){
      messageEl.textContent = 'Not solved yet — some cells are incorrect or empty.';
      return;
    }
  }
  messageEl.textContent = 'Congratulations — you solved it! 🎉';
}

/* Reveal solution (fill board) */
function solvePuzzle(){
  if(!solvedBoard) return;
  puzzleBoard = deepCopy(solvedBoard);
  givenMask = solvedBoard.map(r => r.map(_ => true));
  render(puzzleBoard, givenMask);
  messageEl.textContent = 'Solved (revealed).';
}

/* Event listeners */
newBtn.addEventListener('click', newGame);
checkBtn.addEventListener('click', checkSolution);
solveBtn.addEventListener('click', solvePuzzle);
publishGuideBtn.addEventListener('click', ()=>{
  alert('To publish: 1) Create a GitHub repo, 2) push these files (index.html, style.css, script.js), 3) enable GitHub Pages from repo Settings -> Pages -> Deploy from branch -> main. Or use Netlify/Vercel drag-and-drop. See README.md for full steps.');
});

/* Boot */
newGame();
