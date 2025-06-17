# League Standings Calculation Algorithm

This algorithm computes the win/loss standings for each team up to a specified date, based on the `game_logs` table where each row represents a player's stats for a game.

## Steps

1. **Select Unique Games**  
   - For each unique `GAME_ID`, select a single row (any player) to represent the game.
   - Extract the game date, home and away team IDs, the win/loss indicator (`WL`), and the matchup type (`MATCHUP`).

2. **Determine Game Winners and Losers**  
   - Use the `WL` and `MATCHUP` columns to identify which team won and which team lost:
     - If `MATCHUP` contains `'vs.'`, the team is playing at home.
     - If `MATCHUP` contains `'@'`, the team is playing away.
     - Assign the win to the correct team based on these indicators.

3. **Aggregate Wins and Losses**  
   - Count the number of wins for each team by grouping on the winner's team ID.
   - Count the number of losses for each team by grouping on the loser's team ID.

4. **Combine Results for Standings**  
   - For each team, sum up their total wins and losses.
   - Calculate games played (`GP = wins + losses`) and win percentage (`W_PCT = wins / (wins + losses)`).

5. **Order the Standings**  
   - Sort teams by win percentage (descending) and then by total wins.

---

**Note:**  
- The algorithm ensures each game is only counted once, regardless of the number of player entries.
- If team names are not available, only team IDs are shown in the output.
- The query uses the `crt_date` value from the `app_settings` table (where `id = 1`) to determine the current date for filtering games included in the standings calculation. 