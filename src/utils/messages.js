const messageObj = (message) => {
    return {
        text: message,
        CreatedAt: new Date().getTime() 
    }
}
const generateLocationUrl = (url) => {
    return {
        url,
        CreatedAt: new Date().getTime() 
    }
}

module.exports = {
    messageObj,
    generateLocationUrl
}