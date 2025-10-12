import React from 'react';
import { Chessboard } from 'react-chessboard';

export default function TestChessboardArrows() {
  // Przykładowa strzałka z e2 na e4
  const arrows: ([string, string] | [string, string, string])[] = [
    ['e2', 'e4', 'red'],
    ['g1', 'f3', 'blue']
  ];

  return (
    <div style={{ padding: 40 }}>
      <h2>Test Chessboard Arrows</h2>
      <Chessboard
        position="start"
        boardWidth={400}
        customArrows={arrows as any}
        areArrowsAllowed={true}
      />
      <div style={{ marginTop: 20 }}>
        <pre>{JSON.stringify(arrows, null, 2)}</pre>
      </div>
    </div>
  );
}
