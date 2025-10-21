document.addEventListener('DOMContentLoaded', () => {
  fetch("leaderboard.txt")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(data => {
      const regex = /Rank: (\d+), Observer: ([^,]+), Cont: ([^,]+), Observations: (\d+), Percentage: ([^%]+)%, Grid Locator: ([^,]+), Coordinates: \(([^,]+), ([^)]+)\)/g;
      const leaderboard = [];
      let match;

      // Extract leaderboard data
      while ((match = regex.exec(data)) !== null) {
        const rank = parseInt(match[1]);
        const observer = match[2];
        const continent = match[3];
        const percentage = parseFloat(match[5]);
        leaderboard.push({ rank, observer, continent, percentage });
      }

      // Sort leaderboard by percentage in descending order
      leaderboard.sort((a, b) => b.percentage - a.percentage);

      // Select leaderboard container
      const leaderboardList = document.querySelector('.leaderboard-widget ol');
      leaderboardList.innerHTML = ''; // ✅ Clear "Loading..." or any existing items

      // Display top 5 ranked observers
      if (leaderboard.length > 0) {
        for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
          const item = leaderboard[i];
          const li = document.createElement('li');
          li.textContent = `${item.rank}. ${item.observer}, ${item.percentage}% - ${item.continent}`;
          leaderboardList.appendChild(li);
        }

        // ✅ Optional: Add a small “Last updated” line
        const updated = document.createElement('div');
        updated.style.fontSize = '11px';
        updated.style.marginTop = '6px';
        updated.style.textAlign = 'right';
        updated.style.color = '#555';
        updated.textContent = `Updated: ${new Date().toUTCString()}`;
        leaderboardList.parentElement.appendChild(updated);

      } else {
        leaderboardList.innerHTML = '<li>No leaderboard data available.</li>';
      }
    })
    .catch(error => {
      console.error('Error fetching leaderboard data:', error);
      const leaderboardList = document.querySelector('.leaderboard-widget ol');
      leaderboardList.innerHTML = '<li>Leaderboard unavailable.</li>';
    });
});
