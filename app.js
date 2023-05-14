const express = require('express');
const axios = require('axios');
const path = require('path');

const config = require('./config');

const app = express();
console.log("Express app created.");
  
app.listen(3000, () => console.log('Server started on port 3000'));

app.use(express.json());

// serve static files
app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/static/index.html'));
});

// neo-stats api
app.get('/api/v1/neo-stats', async(req, res) => {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
        console.log(`Bad User Input start_date: ${start_date} and end_date: ${end_date}`);
        res.status(400).send({error: 'Provide start_date and end_date in YYYY-MM-DD format'});
        return;
    }

    const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=${config.API_KEY}`;

    try {
        const response = await axios.get(apiUrl);

        const dates = Object.keys(response.data.near_earth_objects);

        // const asteroidCount = {};
        // for (let date of dates) {
        //     asteroidCount[date] = response.data.near_earth_objects[date].length;  
        // }
        
        const asteroidCount = dates.sort().map((date) => {
            return {[date]: response.data.near_earth_objects[date].length};
        });

        const fastestAsteroid = findFastestAsteroid(response.data.near_earth_objects);
        const closestAsteroid = findClosestAsteroid(response.data.near_earth_objects);
        const averageSize = calculateAverageSize(response.data.near_earth_objects);

        res.send({
            'fastest_asteroid': fastestAsteroid,
            'closest_asteroid': closestAsteroid,
            'average_size': averageSize,
            'asteroid_count': asteroidCount,
        });
    } catch (error) {

        if (axios.isAxiosError(error)) {
            console.log({response: {
                status: error.response?.status,
                data: error.response?.data,
              }})

              res.status(error.response?.status || 500).send(error.response?.data);
        }

        else {
            console.error(error);
            res.status(500).send({error_message: 'Error parsing NEO data'});
        }
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