/* Simple Sudoku with Timer + 3x3 Borders */

/* Helpers */
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }
function deepCopy(board){ return board.map(r=>r.slice()); }

/* Board utilities */
function isSafe(board, row, col, num){
  for(let x=0;x<9;x++) if(board[row][x]===num) return false;
  for(let x=0;x<9;x++) if(board[x][col]===num) return false;
  const startRow=row-row%3, startCol=col-col%3;
  for(let r=0;r<3;r++) for(let c=0;c<3;c++) if(board[startRow+r][startCol+c]===num) return false;
  return true;
}

/* Backtracking Filler */
function fillBoard(board){
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(board[r][c]===0){
        let nums=shuffle([1,2,3,4,5,6,7,8,9]);
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
  return true;
}

/* Count Solutions */
function countSolutions(board, limit=2){
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(board[r][c]===0){
        let count=0;
        for(let n=1;n<=9;n++){
          if(isSafe(board,r,c,n)){
            board[r][c]=n;
            count+=countSolutions(board,limit);
            if(count>=limit){ board[r][c]=0; return count; }
            board[r][c]=0;
          }
        }
        return count;
      }
    }
  }
  return 1;
}

/* Difficulty -> cells removed */
const difficultyMap={easy:36, medium:48, hard:54};

/* Puzzle Creator */
function makePuzzle(fullBoard, removals){
  let puzzle=deepCopy(fullBoard);
  let attempts=removals*3;
  while(removals>0 && attempts>0){
    let r=Math.floor(Math.random()*9), c=Math.floor(Math.random()*9);
    if(puzzle[r][c]===0){ attempts--; continue; }
    let backup=puzzle[r][c];
    puzzle[r][c]=0;
    let copy=deepCopy(puzzle);
    let sols=countSolutions(copy,2);
    if(sols!==1) puzzle[r][c]=backup;
    else removals--;
    attempts--;
  }
  return puzzle;
}

/* UI Elements */
const boardEl=document.getElementById('board');
const newBtn=document.getElementById('newBtn');
const checkBtn=document.getElementById('checkBtn');
const solveBtn=document.getElementById('solveBtn');
const difficultyEl=document.getElementById('difficulty');
const messageEl=document.getElementById('message');

/* Timer */
let startTime=null, timerInterval=null;

function startTimer(){
  startTime=Date.now();
  if(timerInterval) clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    const seconds=Math.floor((Date.now()-startTime)/1000);
    const m=String(Math.floor(seconds/60)).padStart(2,'0');
    const s=String(seconds%60).padStart(2,'0');
    messageEl.textContent=`Time: ${m}:${s}`;
  },1000);
}

/* Render Board + bold borders */
function render(board, given){
  boardEl.innerHTML='';
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const cell=document.createElement('div');
      cell.className='cell';

      if(r%3===0) cell.classList.add('row-bold-top');
      if(r===8) cell.classList.add('row-bold-bottom');
      if(c%3===0) cell.classList.add('col-bold-left');
      if(c===8) cell.classList.add('col-bold-right');

      if(given[r][c]){
        cell.classList.add('given');
        cell.textContent=board[r][c];
      } else {
        const inp=document.createElement('input');
        inp.type='text'; inp.maxLength=1;
        inp.dataset.r=r; inp.dataset.c=c;
        inp.value=board[r][c]===0?'':board[r][c];
        inp.addEventListener('input', onInput);
        cell.appendChild(inp);
      }
      boardEl.appendChild(cell);
    }
  }
}

function onInput(e){
  const r=+e.target.dataset.r, c=+e.target.dataset.c;
  let val=e.target.value.trim();
  if(val===''){ puzzleBoard[r][c]=0; return; }
  val=parseInt(val);
  if(isNaN(val)||val<1||val>9){ e.target.value=''; puzzleBoard[r][c]=0; return; }
  puzzleBoard[r][c]=val;
}

/* Create new game */
let solvedBoard=null, puzzleBoard=null, givenMask=null;

function newGame(){
  startTimer();
  messageEl.textContent='Generating...';
  setTimeout(()=>{
    let empty=Array.from({length:9},()=>Array(9).fill(0));
    fillBoard(empty);
    solvedBoard=deepCopy(empty);
    const diff=difficultyEl.value;
    puzzleBoard=makePuzzle(solvedBoard,difficultyMap[diff]);
    givenMask=puzzleBoard.map(r=>r.map(c=>c!==0));
    render(puzzleBoard,givenMask);
  },10);
}

/* Check solution */
function checkSolution(){
  for(let r=0;r<9;r++) for(let c=0;c<9;c++){
    if(puzzleBoard[r][c]!==solvedBoard[r][c]) return messageEl.textContent='Incorrect or incomplete!';
  }
  messageEl.textContent='🎉 Correct! You solved it!';
}

/* Solve puzzle */
function solvePuzzle(){
  puzzleBoard=deepCopy(solvedBoard);
  givenMask=solvedBoard.map(r=>r.map(_=>true));
  render(puzzleBoard,givenMask);
  messageEl.textContent='Solved!';
}

/* Listeners */
newBtn.addEventListener('click', newGame);
checkBtn.addEventListener('click', checkSolution);
solveBtn.addEventListener('click', solvePuzzle);

/* Boot */
newGame();
