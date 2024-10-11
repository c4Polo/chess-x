import React, { useState } from 'react';
import './App.css';
import './Chessboard.css';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

let initialPosts = [
  {
    id: 1,
    username: 'chessmaster1',
    content: 'Just finished an amazing game! #chesslife',
    caption: 'A great match with unexpected moves!',
    fen: 'start',
    comments: ['Great game, well played!'],
    suggestedMoves: []
  },
  {
    id: 2,
    username: 'rookieplayer123',
    content: 'What do you think of this opening? #chessadvice',
    caption: 'Trying out new openings to improve my game.',
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    comments: ['Interesting opening choice, I would have played differently.'],
    suggestedMoves: []
  },
  {
    id: 3,
    username: 'queenmovepro',
    content: 'Checkmate in 3 moves! Can you solve it? #puzzletime',
    caption: 'Can you find the winning moves in this puzzle?',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    comments: ['I love these puzzles, so challenging!'],
    suggestedMoves: []
  },
];

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newUsername, setNewUsername] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newFen, setNewFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq');
  const [newComment, setNewComment] = useState('');
  const [newMove, setNewMove] = useState('');
  const [newSuggestedMoves, setNewSuggestedMoves] = useState([]);
  const [game, setGame] = useState(new Chess(posts[currentIndex].fen !== 'start' ? posts[currentIndex].fen : undefined));
  const [currentTurn, setCurrentTurn] = useState(game.turn() === 'w' ? 'White' : 'Black');
  const [postBoardFen, setPostBoardFen] = useState('start');
  const [postMoves, setPostMoves] = useState([]);
  const [newPgn, setNewPgn] = useState('');
  const [postGame, setPostGame] = useState(new Chess());
  const [postGameHistory, setPostGameHistory] = useState([]);
  const [postGameCurrentMove, setPostGameCurrentMove] = useState(-1);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % posts.length;
      const newGame = new Chess(posts[newIndex].fen !== 'start' ? posts[newIndex].fen : undefined);
      setGame(newGame);
      setCurrentTurn(newGame.turn() === 'w' ? 'White' : 'Black');
      return newIndex;
    });
  };

  const handleAddPost = () => {
    if (newUsername && newContent && newCaption && newFen) {
      const newPost = {
        id: posts.length + 1,
        username: newUsername,
        content: newContent,
        caption: newCaption,
        fen: newFen || 'start',
        comments: [],
        suggestedMoves: newSuggestedMoves,
        moves: postMoves
      };
      setPosts([...posts, newPost]);
      setNewUsername('');
      setNewContent('');
      setNewCaption('');
      setNewFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq');
      setNewSuggestedMoves([]);
      setPostBoardFen('start');
      setPostMoves([]);
    }
  };

  const handleAddComment = () => {
    if (newComment) {
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post, index) =>
          index === currentIndex ? { ...post, comments: [...post.comments, newComment] } : post
        );
        return updatedPosts;
      });
      setNewComment('');
    }
  };

  const handleAddMoveToPost = () => {
    if (newMove) {
      const gameCopy = new Chess(newFen !== 'start' ? newFen : undefined);
      const move = gameCopy.move(newMove);
      if (move) {
        setNewSuggestedMoves((prevMoves) => [...prevMoves, move.san]);
      } else {
        alert('Invalid move, please try again.');
      }
      setNewMove('');
    }
  };

  const executeMove = (move) => {
    const gameCopy = new Chess(game.fen());
    const validMove = gameCopy.move(move);
    if (validMove) {
      setGame(gameCopy);
      setCurrentTurn(gameCopy.turn() === 'w' ? 'White' : 'Black');
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    try {
      const gameCopy = new Chess(game.fen());
      const piece = gameCopy.get(sourceSquare);

      if ((game.turn() === 'w' && piece.color !== 'w') || (game.turn() === 'b' && piece.color !== 'b')) {
        return false;
      }

      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });

      if (move === null) {
        return false;
      }

      setGame(gameCopy);
      setCurrentTurn(gameCopy.turn() === 'w' ? 'White' : 'Black');
      return true;
    } catch (error) {
      console.error("An error occurred while making a move: ", error);
      return false;
    }
  };

  const handleFenChange = (event) => {
    setNewFen(event.target.value);
    setPostBoardFen(event.target.value);
  };

  const onPostBoardDrop = (sourceSquare, targetSquare) => {
    try {
      const gameCopy = new Chess(postBoardFen);
      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });

      if (move === null) {
        return false;
      }

      setPostBoardFen(gameCopy.fen());
      setPostMoves((prevMoves) => [...prevMoves, move.san]);
      return true;
    } catch (error) {
      console.error("An error occurred while making a move on post board: ", error);
      return false;
    }
  };

  const executePostMove = (move) => {
    const gameCopy = new Chess(postBoardFen);
    const validMove = gameCopy.move(move);
    if (validMove) {
      setPostBoardFen(gameCopy.fen());
    }
  };

  const handleNextMove = (isMainBoard) => {
    if (isMainBoard) {
      const gameCopy = new Chess(game.fen());
      if (gameCopy.history().length < posts[currentIndex].moves.length) {
        gameCopy.move(posts[currentIndex].moves[gameCopy.history().length]);
        setGame(gameCopy);
        setCurrentTurn(gameCopy.turn() === 'w' ? 'White' : 'Black');
      }
    } else {
      if (postGameCurrentMove < postGameHistory.length - 1) {
        const nextMove = postGameCurrentMove + 1;
        const gameCopy = new Chess(postGame.fen());
        gameCopy.move(postGameHistory[nextMove]);
        setPostGame(gameCopy);
        setPostBoardFen(gameCopy.fen());
        setPostGameCurrentMove(nextMove);
      }
    }
  };

  const handlePreviousMove = (isMainBoard) => {
    if (isMainBoard) {
      const gameCopy = new Chess(game.fen());
      gameCopy.undo();
      setGame(gameCopy);
      setCurrentTurn(gameCopy.turn() === 'w' ? 'White' : 'Black');
    } else {
      if (postGameCurrentMove >= 0) {
        const prevMove = postGameCurrentMove - 1;
        const gameCopy = new Chess();
        gameCopy.loadPgn(postGame.pgn());
        for (let i = 0; i <= prevMove; i++) {
          gameCopy.move(postGameHistory[i]);
        }
        setPostGame(gameCopy);
        setPostBoardFen(gameCopy.fen());
        setPostGameCurrentMove(prevMove);
      }
    }
  };

  const handlePgnParse = () => {
    try {
      const newGame = new Chess();
      if (newPgn.trim() !== '') {
        // Split the PGN into moves
        const moves = newPgn.split(/\d+\./).filter(move => move.trim() !== '');
        
        // Apply each move
        moves.forEach(move => {
          const [whiteMove, blackMove] = move.trim().split(' ');
          if (whiteMove) newGame.move(whiteMove);
          if (blackMove) newGame.move(blackMove);
        });
  
        setPostGame(newGame);
        setPostGameHistory(newGame.history());
        setPostGameCurrentMove(-1);
        setPostBoardFen(newGame.fen());
        setPostMoves(newGame.history());
        setNewFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq');
      } else {
        throw new Error("PGN is empty");
      }
    } catch (error) {
      console.error("Error parsing PGN:", error);
      alert("Invalid PGN. Please check your input.");
    }
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="feed-container" style={{ display: 'flex', flexDirection: 'row', marginBottom: '40px' }}>
        <div className="chessboard-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginRight: '20px' }}>
          <Chessboard
            id="BasicBoard"
            boardWidth={300}
            position={game.fen()}
            onPieceDrop={onDrop}
          />
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => handlePreviousMove(true)}>Previous Move</button>
            <button onClick={() => handleNextMove(true)}>Next Move</button>
          </div>
        </div>
        <div className="post-content" style={{ maxWidth: '400px' }}>
          <div className="post-header">
            <h2>@{posts[currentIndex].username}</h2>
            <p><strong>Caption:</strong> {posts[currentIndex].caption}</p>
          </div>
          <div className="post-body">
            <p>{posts[currentIndex].content}</p>
            <h4>Current Turn: {currentTurn}</h4>
            <button onClick={handleNext}>Next Post</button>
          </div>
          <div className="comments-section">
            <h4>Comments</h4>
            <ul>
              {posts[currentIndex].comments.map((comment, index) => (
                <li key={index}>{comment}</li>
              ))}
            </ul>
            <input
              type="text"
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleAddComment}>Add Comment</button>
          </div>
        </div>
      </div>

      <div className="new-post-form" style={{ display: 'flex', flexDirection: 'row', marginTop: '40px' }}>
        <div className="chessboard-container centered" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginRight: '20px' }}>
          <Chessboard
            id="PostBoard"
            boardWidth={300}
            position={postBoardFen}
            onPieceDrop={onPostBoardDrop}
          />
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => handlePreviousMove(false)}>Previous Move</button>
            <button onClick={() => handleNextMove(false)}>Next Move</button>
          </div>
        </div>
        <div className="form-content" style={{ maxWidth: '400px' }}>
          <h3>Create a New Post</h3>
          <input
            type="text"
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <input
            type="text"
            placeholder="Caption"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
          />
          <input
            type="text"
            placeholder="FEN"
            value={newFen}
            onChange={handleFenChange}
          />
          <textarea
            placeholder="Enter PGN"
            value={newPgn}
            onChange={(e) => setNewPgn(e.target.value)}
            rows={4}
          />
          <button onClick={handlePgnParse}>Parse PGN</button>
          <input
            type="text"
            placeholder="Enter a move (e.g., e4)"
            value={newMove}
            onChange={(e) => setNewMove(e.target.value)}
          />
          <button onClick={handleAddMoveToPost}>Validate Move</button>
          <div className="new-suggested-moves">
            <h4>New Suggested Moves:</h4>
            <ul>
              {newSuggestedMoves.map((move, index) => (
                <li key={index}>{move}</li>
              ))}
            </ul>
          </div>
          <button onClick={handleAddPost}>Add Post</button>
        </div>
      </div>
    </div>
  );
}

export default App;