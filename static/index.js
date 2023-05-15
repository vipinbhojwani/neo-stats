const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const form = document.getElementById('form');
const chart = document.getElementById('chart');
const fastestAsteroidElement = document.getElementById('fastestAsteroid');
const closestAsteroidElement = document.getElementById('closestAsteroid');
const avgSize = document.getElementById('avgSize');
let canvasChart;

fetchAndLoadChart = (fastestAsteroid, closestAsteroid, averageSize, asteroidCount) => {
    refreshStats(fastestAsteroid, closestAsteroid, averageSize);
    refreshChart(asteroidCount);
    showResults();
}

setInputValuesFromUrlParams = () => {
    var urlParams = new URLSearchParams(window.location.search);

    var startDate = urlParams.get("startDate");
    var endDate = urlParams.get("endDate");

    if (startDate) {
        $("#startDate").val(startDate);
    }
    if(endDate) {
        $("#endDate").val(endDate);
    }
}

showResults = () => {
    $("#results-stats").show();
}

showError = (message) => {
    $("#error").text(message);
    $("#error").show();
}

refreshStats = (fastestAsteroid, closestAsteroid, averageSize) => {
    console.log('Refreshing Stats');
    fastestAsteroidElement.textContent = `${fastestAsteroid.name}`;
    closestAsteroidElement.textContent = `${closestAsteroid.name}`;
    avgSize.textContent = `${averageSize.toFixed(2)} km`;
}

refreshChart = (asteroidCount) => {
    console.log('Refreshing Chart');
    const asteroids = asteroidCount;
    const counts = asteroids.map(a => Object.values(a)[0]);
    const labels = asteroids.map(a => Object.keys(a)[0]);
    const ctx = chart.getContext('2d');
    if (canvasChart != undefined) {
        canvasChart.destroy();
    }
    canvasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Asteroid Counts',
                    data: counts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        },
    });
}
