let board=["","","","","","","","",""];
let currentPlayer="X";
let gameActive=false;
let mode=null;
let scoreX=0, scoreO=0;

const boardEl=document.getElementById("board");
const statusText=document.getElementById("status");
const scoreXEl=document.getElementById("scoreX");
const scoreOEl=document.getElementById("scoreO");
const difficultySelect=document.getElementById("difficulty");

const winPatterns=[
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
];

document.getElementById("twoPlayerBtn").onclick=()=>setMode("two");
document.getElementById("aiBtn").onclick=()=>setMode("ai");
document.getElementById("restartBtn").onclick=restartGame;
document.getElementById("themeToggle").onclick=toggleTheme;

function createBoard(){
    boardEl.innerHTML="";
    board.forEach((_,i)=>{
        const cell=document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index=i;
        cell.onclick=handleClick;
        boardEl.appendChild(cell);
    });
}
createBoard();

function setMode(selected){
    mode=selected;
    restartGame();
    gameActive=true;
    statusText.textContent="Player X Turn";
}

function handleClick(e){
    const i=e.target.dataset.index;
    if(board[i]!==""||!gameActive) return;

    makeMove(i,currentPlayer);

    if(mode==="ai" && gameActive && currentPlayer==="O"){
        setTimeout(aiMove,300);
    }
}

function makeMove(i,player){
    board[i]=player;
    document.querySelectorAll(".cell")[i].textContent=player;
    checkWinner();
}

function aiMove(){
    const level=difficultySelect.value;

    if(level==="easy") randomMove();
    else if(level==="medium") Math.random()<0.5 ? randomMove() : bestMove();
    else bestMove();
}

function randomMove(){
    let empty=board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    let move=empty[Math.floor(Math.random()*empty.length)];
    makeMove(move,"O");
}

function bestMove(){
    let bestScore=-Infinity;
    let move;
    for(let i=0;i<9;i++){
        if(board[i]===""){
            board[i]="O";
            let score=minimax(board,0,false);
            board[i]="";
            if(score>bestScore){
                bestScore=score;
                move=i;
            }
        }
    }
    makeMove(move,"O");
}

function minimax(newBoard,depth,isMax){
    const winner=getWinner();
    if(winner==="O") return 10-depth;
    if(winner==="X") return depth-10;
    if(!newBoard.includes("")) return 0;

    if(isMax){
        let best=-Infinity;
        for(let i=0;i<9;i++){
            if(newBoard[i]===""){
                newBoard[i]="O";
                best=Math.max(best,minimax(newBoard,depth+1,false));
                newBoard[i]="";
            }
        }
        return best;
    }else{
        let best=Infinity;
        for(let i=0;i<9;i++){
            if(newBoard[i]===""){
                newBoard[i]="X";
                best=Math.min(best,minimax(newBoard,depth+1,true));
                newBoard[i]="";
            }
        }
        return best;
    }
}

function getWinner(){
    for(let p of winPatterns){
        const[a,b,c]=p;
        if(board[a]&&board[a]===board[b]&&board[a]===board[c])
            return board[a];
    }
    return null;
}

function checkWinner(){
    const winner=getWinner();
    if(winner){
        highlightWin(winner);
        statusText.textContent=`${winner} Wins!`;
        if(winner==="X"){scoreX++;scoreXEl.textContent=scoreX;}
        else{scoreO++;scoreOEl.textContent=scoreO;}
        gameActive=false;
        return;
    }

    if(!board.includes("")){
        statusText.textContent="Draw!";
        gameActive=false;
        return;
    }

    currentPlayer=currentPlayer==="X"?"O":"X";
    statusText.textContent=`Player ${currentPlayer} Turn`;
}

function highlightWin(player){
    winPatterns.forEach(p=>{
        const[a,b,c]=p;
        if(board[a]===player&&board[b]===player&&board[c]===player){
            document.querySelectorAll(".cell")[a].classList.add("win");
            document.querySelectorAll(".cell")[b].classList.add("win");
            document.querySelectorAll(".cell")[c].classList.add("win");
        }
    });
}

function restartGame(){
    board=["","","","","","","","",""];
    currentPlayer="X";
    gameActive=false;
    createBoard();
    statusText.textContent="Select Mode";
}

function toggleTheme(){
    document.body.classList.toggle("light");
    document.getElementById("themeToggle").textContent=
        document.body.classList.contains("light")?"☀️":"🌙";
}