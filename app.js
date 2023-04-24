new Vue({
    el: "#app",
    
    data: {
        startDate: "",
        endDate: "",
        startDateFormatted: "",
        endDateFormatted: "",
        asteroidData: [],
        fastestAsteroid: {},
        closestAsteroid: {},
        avgSize: 0,
    },
    
    methods: {
        submitForm() {
            // Convert start and end dates to YYYY-MM-DD format
            this.startDateFormatted = moment(this.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
            this.endDateFormatted = moment(this.endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
            this.fetchAsteroidData(startDateFormatted, endDateFormatted);
        },
        
        fetchAsteroidData(startDateFormatted, endDateFormatted) {
            // Make API request with formatted dates
            const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${this.startDateFormatted}&end_date=${this.endDateFormatted}&api_key=a9ZWIGm4Ta5xIa4o01RpSUwGImc6kN55f5e5ugAq`;
            axios.get(url).then((response) => {
                const data = response.data.near_earth_objects;
                this.asteroidData = this.processAsteroidData(data);
                this.fastestAsteroid = this.findFastestAsteroid(data);
                this.closestAsteroid = this.findClosestAsteroid(data);
                this.avgSize = this.calculateAverageSize(data);
                this.renderChart();
            });
        },

        processAsteroidData(data) {
            const asteroidData = {};

            for (const date in data) {
                asteroidData[date] = data[date].length;
            }

            return asteroidData;
        },

        findFastestAsteroid(data) {
            let fastest = data[Object.keys(data)[0]][0];

            for (const date in data) {
                data[date].forEach((asteroid) => {
                    if (asteroid.close_approach_data[0].relative_velocity
                        .kilometers_per_hour > fastest.close_approach_data[0].relative_velocity
                        .kilometers_per_hour) {
                            fastest = asteroid;
                        }
                });
            }

            return fastest;
        },

        findClosestAsteroid(data) {
            let closest = data[Object.keys(data)[0]][0];

            for (const date in data) {
                data[date].forEach((asteroid) => {
                    if (asteroid.close_approach_data[0].miss_distance
                        .kilometers < closest.close_approach_data[0].miss_distance
                        .kilometers) {
                            closest = asteroid;
                        }
                });
            }

            return closest;
        },

        calculateAverageSize(data) {
            let totalSize = 0;
            let asteroidCount = 0;

            for (const date in data) {
                data[date].forEach((asteroid) => {
                    totalSize += asteroid.estimated_diameter.kilometers.estimated_diameter_max;
                    asteroidCount++;
                });
            }

            return totalSize / asteroidCount;
        },

        renderChart() {
            const chartData = {
                labels: Object.keys(this.asteroidData),
                datasets: [
                    {
                        label: "Number of Asteroid",
                        data: Object.values(this.asteroidData),
                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1,
                    },
                ],
            };

            const chartOptions = {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                            },
                        },
                    ],
                },
            };

            const ctx = document.getElementById("chart").getContext("2d");

            const chart = new Chart(ctx, {
                type: "line",
                data: chartData,
                options: chartOptions,
            });
        },
    },
});