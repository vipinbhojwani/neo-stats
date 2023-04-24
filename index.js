const express = require('express');
const axios = require('axios');
const moment = require('moment');
const Chart = require('chart.js');

const app = express();
console.log("Express app created.");

app.listen(3000, () => console.log('Server started on port 3000'));

app.use(express.json());

app.post('/neo-stats', async(req, res) => {
    const { start_date, end_date } = req.body;

    const apiUrl = 'https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=a9ZWIGm4Ta5xIa4o01RpSUwGImc6kN55f5e5ugAq';

    try {
        const response = await axios.get(apiUrl);

        const dates = Object.keys(response.data.near_earth_objects);

        const asteroidCount = dates.map((date) => {
            return response.data.near_earth_objects[date].length;
        });

        const fastestAsteroid = findFastestAsteroid(response.data.near_earth_objects);

        const closestAsteroid = findClosestAsteroid(response.data.near_earth_objects);

        const averageSize = calculateAverageSize(response.data.near_earth_objects);

        const chart = createLineChart(dates, asteroidCount);

        res.send({
            chart,
            fastestAsteroid,
            closestAsteroid,
            averageSize
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching NEO data');
    }
});

function findFastestAsteroid(near_earth_objects) {
    let fastest = null;

    Object.keys(near_earth_objects).forEach((date) => {
        near_earth_objects[date].forEach((asteroid) => {
            if (fastest === null || asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour > fastest.close_approach_data[0].relative_velocity.kilometers_per_hour) {
                fastest = asteroid;
            }
        });
    });

    return fastest;
}

function findClosestAsteroid(near_earth_objects) {
    let closest = null;

    Object.keys(near_earth_objects).forEach((date) => {
        near_earth_objects[date].forEach((asteroid) => {
            if (closest === null || asteroid.close_approach_data[0].miss_distance.kilometers < closest.close_approach_data[0].miss_distance.kilometers) {
                closest = asteroid;
            }
        });
    });

    return closest;
}

function calculateAverageSize(near_earth_objects) {
    let totalSize = 0;
    let count = 0;

    Object.keys(near_earth_objects).forEach((date) => {
        near_earth_objects[date].forEach((asteroid) => {
            totalSize += asteroid.estimated_diameter.kilometers.estimated_diameter_max;
            count++;
        });
    });

    return totalSize / count;
}

function createLineChart(labels, data) {
    const ctx = document.getElementById('chart').getContext('2d');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Asteroids Passing Near Earth',
                data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },

        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}