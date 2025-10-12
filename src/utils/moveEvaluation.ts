// Helper do pokazywania jakości ostatniego ruchu
export function formatEvaluationFromMovePerpsective(
  score: number | string, 
  activeColorAfterMove: 'w' | 'b'
): { display: string, advantage: 'white' | 'black' | 'equal', barPosition: number } {
  
  if (typeof score === 'string') {
    // Mate score - zawsze interpretujemy normalnie
    const isWhiteMate = score.startsWith('M') && !score.startsWith('M-')
    return {
      display: score,
      advantage: isWhiteMate ? 'white' : 'black',
      barPosition: isWhiteMate ? 100 : 0
    }
  }

  // Silnik daje ewaluację POZYCJI po ruchu (+ = białe lepiej, - = czarne lepiej)
  // Ale w trybie "perspektywa ruchu" chcemy pokazać JAK DOBRY był ten ruch
  
  const whoJustPlayed = activeColorAfterMove === 'b' ? 'white' : 'black'
  console.log(`📊 Move perspective: ${whoJustPlayed} just played. Position eval: ${score.toFixed(2)}`)
  
  // Ewaluacja pokazuje stan pozycji - nie odwracamy jej
  const adjustedScore = score
  
  // Interpretacja:
  // Jeśli białe zagrały i pozycja jest +3.0 = dobry ruch białych
  // Jeśli białe zagrały i pozycja jest -3.0 = słaby ruch białych  
  // Jeśli czarne zagrały i pozycja jest -3.0 = dobry ruch czarnych
  // Jeśli czarne zagrały i pozycja jest +3.0 = słaby ruch czarnych
  
  const advantage = adjustedScore > 0.1 ? 'white' : adjustedScore < -0.1 ? 'black' : 'equal'
  const display = adjustedScore > 0 ? `+${adjustedScore.toFixed(2)}` : adjustedScore.toFixed(2)
  
  // Convert score to percentage for evaluation bar
  const barPosition = Math.max(10, Math.min(90, 50 + (adjustedScore * 10)))

  return { display, advantage, barPosition }
}