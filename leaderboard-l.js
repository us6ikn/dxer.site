document.addEventListener("DOMContentLoaded", () => {
  const leaderboardList = document.getElementById("leaderboard-list");
  const leaderboardWidget = document.getElementById("leaderboard");
  const showButton = document.querySelector(".show-button");

  // Load leaderboard data
  fetch("leaderboard.txt")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((data) => {
      const regex =
        /Rank: (\d+), Observer: ([^,]+), Cont: ([^,]+), Observations: (\d+), Percentage: ([^%]+)%, Grid Locator: ([^,]+), Coordinates: \(([^,]+), ([^)]+)\)/g;

      const leaderboard = [];
      let match;

      while ((match = regex.exec(data)) !== null) {
        leaderboard.push({
          rank: parseInt(match[1]),
          observer: match[2],
          continent: match[3],
          percentage: parseFloat(match[5]),
        });
      }

      // Sort descending
      leaderboard.sort((a, b) => b.percentage - a.percentage);

      // Clear placeholder text
      leaderboardList.innerHTML = "";

      // Populate top 5
      if (leaderboard.length > 0) {
        leaderboard
          .slice(0, 5)
          .forEach((entry) => {
            const li = document.createElement("li");
            li.textContent = `${entry.rank}. ${entry.observer}, ${entry.percentage}% - ${entry.continent}`;
            leaderboardList.appendChild(li);
          });
      } else {
        leaderboardList.innerHTML = "<li>No data available.</li>";
      }
    })
    .catch((error) => {
      console.error("Error fetching leaderboard data:", error);
      leaderboardList.innerHTML = "<li>Leaderboard unavailable.</li>";
    });

  // Toggle leaderboard visibility
  window.toggleLeaderboard = function () {
    const isVisible = leaderboardWidget.style.display !== "none";
    if (isVisible) {
      leaderboardWidget.style.display = "none";
      showButton.style.display = "block";
    } else {
      leaderboardWidget.style.display = "block";
      showButton.style.display = "none";
    }
  };
});
