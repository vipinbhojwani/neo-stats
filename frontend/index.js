const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const form = document.getElementById('form');
const chart = document.getElementById('chart');
const fastestAsteroid = document.getElementById('fastestAsteroid');
const closestAsteroid = document.getElementById('closestAsteroid');
const avgSize = document.getElementById('avgSize');

// form.addEventListener('submit', (event) => {
//     event.preventDefault();

// });

$('#search-form').submit(() => {
    fetchAndLoadChart();
    return false;
});

fetchAndLoadChart = () => {
    // fetchStats()
    //     .then(stats => {
    //         refreshStats(stats);
    //         refreshChart(stats);
    //     })
    //     .catch(error => console.error(error));

    stats = 1//
    refreshStats(stats);
    refreshChart(stats);
}

fetchStats = () => {
    console.log('Fetching Stats');
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const url = `http://127.0.0.1:3000/neo-stats?start_date=${startDate}&end_date=${endDate}`;
    return fetch(url)
        .then(response => {
            console.log(response.json()); 
            return response.json();
        });
}

refreshStats = (data) => {
    console.log('Refreshing Stats');
    const asteroids = Object.values(data.near_earth_objects).flat();
    const fastest = asteroids.reduce((prev, curr) => curr.close_approach_data[0].relative_velocity.kilometers_per_hour > prev.close_approach_data[0].relative_velocity.kilometers_per_hour ? curr : prev);
    const closest = asteroids.reduce((prev, curr) => curr.close_approach_data[0].miss_distance.kilometers < prev.close_approach_data[0].miss_distance.kilometers ? curr : prev);
    const avg = asteroids.reduce((prev, curr) => prev + curr.estimated_diameter.kilometers.estimated_diameter_min + curr.estimated_diameter.kilometers.estimated_diameter_max, 0) / asteroids.length;

    fastestAsteroid.textContent = 'Fastest Asteroid: ${fastest.name}';
    closestAsteroid.textContent = 'Closest Asteroid: ${closest.name}';
    avgSize.textContent = 'Average Size of Asteroids: ${avg.toFixed(2)} km';
}

refreshChart = (data) => {
    console.log('Refreshing Chart');
    const asteroids = Object.values(data.near_earth_objects).flat();
    const sizes = asteroids.map(a => (a.estimated_diameter.kilometers.estimated_diameter_min + a.estimated_diameter.kilometers.estimated_diameter_max) / 2);
    const labels = asteroids.map(a => a.name);
    const ctx = chart.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Asteroid Sizes (km)',
                    data: sizes,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        },

        options: {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
            },
        },
    });
}
