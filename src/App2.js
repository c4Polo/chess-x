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
  const [newFen, setNewFen] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newMove, setNewMove] = useState('');
  const [newSuggestedMoves, setNewSuggestedMoves] = useState([]);
  const [game, setGame] = useState(new Chess(posts[currentIndex].fen !== 'start' ? posts[currentIndex].fen : undefined));
  const [currentTurn, setCurrentTurn] = useState(game.turn() === 'w' ? 'White' : 'Black');
  const [postBoardFen, setPostBoardFen] = useState('start');

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
        suggestedMoves: newSuggestedMoves
      };
      setPosts([...posts, newPost]);
      setNewUsername('');
      setNewContent('');
      setNewCaption('');
      setNewFen('');
      setNewSuggestedMoves([]);
      setPostBoardFen('start');
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

      // Prevent picking up the piece if it is not the player's turn
      if ((game.turn() === 'w' && piece.color !== 'w') || (game.turn() === 'b' && piece.color !== 'b')) {
        return false;
      }

      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });

      // Prevent illegal moves
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

  return (
    <div className="App">
      <div className="post-container">
        <h2>@{posts[currentIndex].username}</h2>
        <p>{posts[currentIndex].content}</p>
        <p><strong>Caption:</strong> {posts[currentIndex].caption}</p>
        <p><strong>Current Turn:</strong> {currentTurn}</p>
        <div className="chessboard-container centered">
          <Chessboard
            id="BasicBoard"
            boardWidth={250}
            position={game.fen()}
            onPieceDrop={onDrop}
          />
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
        <div className="suggested-moves-section">
          <h4>Suggested Moves</h4>
          <div className="suggested-moves">
            {posts[currentIndex].suggestedMoves.map((move, index) => (
              <button key={index} onClick={() => executeMove(move)}>{move}</button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={handleNext}>Next Post</button>

      <div className="new-post-form">
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
        <div className="chessboard-container centered">
          <Chessboard
            id="PostBoard"
            boardWidth={250}
            position={postBoardFen}
          />
        </div>
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
  );
}

export default App;