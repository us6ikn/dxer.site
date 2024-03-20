// toggleLeaderboard.js

function toggleLeaderboard() {
    var widget = document.querySelector('.leaderboard-widget');
    var showButton = document.querySelector('.show-button');

    if (widget.style.display === 'none') {
        widget.style.display = 'block';
        showButton.style.display = 'none';
    } else {
        widget.style.display = 'none';
        showButton.style.display = 'block';
    }
}
