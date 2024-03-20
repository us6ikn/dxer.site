fetch("leaderboard.txt")
    .then(response => response.text())
    .then(data => {
        const regex = /Rank: (\d+), Observer: ([^,]+), Cont: ([^,]+), Observations: (\d+), Percentage: ([^%]+)%, Grid Locator: ([^,]+), Coordinates: \(([^,]+), ([^)]+)\)/g;
        let leaderboard = [];
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

        // Display top 5 ranked observers
        const leaderboardList = document.querySelector('.leaderboard-widget ol');
        for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
            const listItem = document.createElement('li');
            listItem.textContent = `${leaderboard[i].rank}. ${leaderboard[i].observer}, ${leaderboard[i].percentage}% - ${leaderboard[i].continent}`;
            leaderboardList.appendChild(listItem);
        }
    })
    .catch(error => {
        console.error('Error fetching leaderboard data:', error);
    });
