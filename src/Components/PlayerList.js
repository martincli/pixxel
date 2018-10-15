import React from 'react';

const PlayerList = (props) => {
  return (
    <div className="player-list content-box">
      {Object.entries(props.players).map(([uid,playerData]) => {
        return (
          <div key={uid}>
            <div>{playerData.name} {uid === props.judgeId && <i className="fa fa-star"></i>}</div>
            <div>{playerData.points}</div>
          </div>
        );
      })}
    </div>
  );
}

export default PlayerList;
