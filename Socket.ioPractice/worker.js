const axios = require('axios');
const redisConnection = require("./redis-connection");

async function getImages(search_query) {
    try {
        const url = `https://pixabay.com/api/?key=8503626-73a3ccf75da35b70e7941e713&q=${search_query}`;
        let response = await axios.get(url);
        return response.data;
    } catch (error) {
        return error;
    }
};

redisConnection.on('search-image:request:*', async (message, channel) => {
    let requestId = message.requestId;
    let eventName = message.eventName;
    let successEvent = `${eventName}:success:${requestId}`;

    let information = message.data.information;

    let data = await getImages(information.search_query);
    let imgURL = [];
    data.hits.forEach(element => {
        imgURL.push(element.webformatURL);
    }, this);

    // console.log(imgURL);

    redisConnection.emit(successEvent, {
        requestId: requestId,
        data: {
            imgURL: imgURL,
            username: information.username,
            search_query: information.search_query,
            message: information.message
        },
        eventName: eventName
    });
});

console.log('Worker started.');