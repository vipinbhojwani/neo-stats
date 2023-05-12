const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const form = document.getElementById('form');
const chart = document.getElementById('chart');
const fastestAsteroid = document.getElementById('fastestAsteroid');
const closestAsteroid = document.getElementById('closestAsteroid');
const avgSize = document.getElementById('avgSize');
let canvasChart;

// form.addEventListener('submit', (event) => {
//     event.preventDefault();

// });


fetchAndLoadChart = () => {
    console.log(startDateInput.value);
    console.log(endDateInput.value);
    hideResults();
    fetchStats()
        .then(stats => {
            refreshStats(stats);
            refreshChart(stats);
            showResults();
        })
        .catch(error => console.error(error));
    
    // stats = {"fastest_asteroid":{"links":{"self":"http://api.nasa.gov/neo/rest/v1/neo/3459087?api_key=a9ZWIGm4Ta5xIa4o01RpSUwGImc6kN55f5e5ugAq"},"id":"3459087","neo_reference_id":"3459087","name":"(2009 HZ67)","nasa_jpl_url":"http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3459087","absolute_magnitude_h":21.2,"estimated_diameter":{"kilometers":{"estimated_diameter_min":0.1529519353,"estimated_diameter_max":0.3420109247},"meters":{"estimated_diameter_min":152.9519353442,"estimated_diameter_max":342.0109247198},"miles":{"estimated_diameter_min":0.095039897,"estimated_diameter_max":0.2125156703},"feet":{"estimated_diameter_min":501.8108275547,"estimated_diameter_max":1122.0831222578}},"is_potentially_hazardous_asteroid":false,"close_approach_data":[{"close_approach_date":"2023-05-02","close_approach_date_full":"2023-May-02 14:30","epoch_date_close_approach":1683037800000,"relative_velocity":{"kilometers_per_second":"26.0393728953","kilometers_per_hour":"93741.7424229238","miles_per_hour":"58247.4732293995"},"miss_distance":{"astronomical":"0.3854726494","lunar":"149.9488606166","kilometers":"57665887.293496778","miles":"35831920.8159324164"},"orbiting_body":"Earth"}],"is_sentry_object":false},"closest_asteroid":{"links":{"self":"http://api.nasa.gov/neo/rest/v1/neo/3703885?api_key=a9ZWIGm4Ta5xIa4o01RpSUwGImc6kN55f5e5ugAq"},"id":"3703885","neo_reference_id":"3703885","name":"(2015 AQ45)","nasa_jpl_url":"http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3703885","absolute_magnitude_h":21.5,"estimated_diameter":{"kilometers":{"estimated_diameter_min":0.1332155667,"estimated_diameter_max":0.2978790628},"meters":{"estimated_diameter_min":133.2155666981,"estimated_diameter_max":297.8790627982},"miles":{"estimated_diameter_min":0.0827762899,"estimated_diameter_max":0.1850934111},"feet":{"estimated_diameter_min":437.0589598459,"estimated_diameter_max":977.2935443908}},"is_potentially_hazardous_asteroid":false,"close_approach_data":[{"close_approach_date":"2023-05-01","close_approach_date_full":"2023-May-01 04:48","epoch_date_close_approach":1682916480000,"relative_velocity":{"kilometers_per_second":"3.6638231146","kilometers_per_hour":"13189.76321274","miles_per_hour":"8195.6059251606"},"miss_distance":{"astronomical":"0.0978396624","lunar":"38.0596286736","kilometers":"14636605.096559088","miles":"9094764.6771598944"},"orbiting_body":"Earth"}],"is_sentry_object":false},"average_size":0.3113761318028572,"asteroid_count":[{"2023-05-01":16},{"2023-05-02":10},{"2023-05-03":9}]}
    
}

fetchStats = () => {
    console.log('Fetching Stats');
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const url = `http://127.0.0.1:3000/neo-stats?start_date=${startDate}&end_date=${endDate}`;
    return fetch(url)
        .then(response => {
            return response.json();
        });
}

hideResults = () => {
    $("#results-stats").hide();
}

showResults = () => {
    $("#results-stats").show();
}

refreshStats = (data) => {
    console.log('Refreshing Stats');
    // const asteroids = Object.values(data.near_earth_objects).flat();
    // const fastest = asteroids.reduce((prev, curr) => curr.close_approach_data[0].relative_velocity.kilometers_per_hour > prev.close_approach_data[0].relative_velocity.kilometers_per_hour ? curr : prev);
    // const closest = asteroids.reduce((prev, curr) => curr.close_approach_data[0].miss_distance.kilometers < prev.close_approach_data[0].miss_distance.kilometers ? curr : prev);
    // const avg = asteroids.reduce((prev, curr) => prev + curr.estimated_diameter.kilometers.estimated_diameter_min + curr.estimated_diameter.kilometers.estimated_diameter_max, 0) / asteroids.length;

    const fastest = data.fastest_asteroid;
    const closest = data.closest_asteroid;
    const avg = data.average_size;
    fastestAsteroid.textContent = `${fastest.name}`;
    closestAsteroid.textContent = `${closest.name}`;
    avgSize.textContent = `${avg.toFixed(2)} km`;
}

refreshChart = (data) => {
    console.log('Refreshing Chart');
    const asteroids = data.asteroid_count;
    // (a.estimated_diameter.kilometers.estimated_diameter_min + a.estimated_diameter.kilometers.estimated_diameter_max) / 2
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
