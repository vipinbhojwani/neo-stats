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

// set view engine to render dynamic HTML
app.set('view engine', 'ejs');
app.get('/neo-stats', async (req, res) => {
    const { startDate, endDate } = req.query;
    console.log(`Input startDate: ${startDate} and endDate: ${endDate}`);
    if (!startDate || !endDate) {
        res.render('index', {data: undefined, error: undefined} );
        return;
    }

    const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${config.API_KEY}`;
    try {
        console.log('calling NASA api to fetch asteroids feed')
        const response = await axios.get(apiUrl);
        console.log(`Response: ${response}`);

        const dates = Object.keys(response.data.near_earth_objects);
        console.log(`got response from NASA api for dates ${dates}`)
        const asteroidCount = dates.sort().map((date) => {
            return { [date]: response.data.near_earth_objects[date].length };
        });

        const fastestAsteroid = findFastestAsteroid(response.data.near_earth_objects);
        const closestAsteroid = findClosestAsteroid(response.data.near_earth_objects);
        const averageSize = calculateAverageSize(response.data.near_earth_objects);

        res.render('index', {
            data: {
                fastestAsteroid,
                closestAsteroid,
                averageSize,
                asteroidCount,
            }, error: undefined
        });
    } catch (error) {

        if (axios.isAxiosError(error)) {
            console.log({
                response: {
                    status: error.response?.status,
                    data: error.response?.data,
                }
            })

            res.render('index', {
                data: undefined, error: {
                    status: error.response?.status || 500,
                    message: error.response?.data.error_message,
                }
            });
        }

        else {
            console.error(error);
            res.render('index', {
                data: undefined, error: {
                    status: 500,
                    message: 'Error parsing NEO data',
                }
            });
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