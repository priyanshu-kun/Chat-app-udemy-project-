const socket = io();
const form = document.querySelector("form");
const locationButton = document.querySelector(".sendLocation")
// select message div
const $messages = document.querySelector(".messages-container");
const $sidebar = document.querySelector("#sidebar");
// select templets
const $messageTemplet = document.querySelector(".message-templets").innerHTML;
const $locationTemplet = document.querySelector(".location-templets").innerHTML;
const $sideBarTemplet = document.querySelector(".rooms-templets").innerHTML;


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


// get message with client and send back to the server
form.addEventListener("submit", (e) => {
    e.preventDefault();

    form.lastElementChild.disabled = true;

    socket.emit("sendMessageFromClient", form.firstElementChild.value, (error) => {
        // event acknoledgement callback to identify the user is not use bad words

        form.lastElementChild.disabled = false;
        if (error) {
            return console.log(error);
        }

        console.log("Message is delivered!");
    });
    form.firstElementChild.value = "";
    form.firstElementChild.focus();
})


const autoScroll = () => {

    // get new message
    const $newMessage = $messages.lastElementChild;

    // get height of new message
    const marginHeight = getComputedStyle($newMessage);

    // get new message height + margin bottom height
    const messageHeight = $newMessage.offsetHeight + parseInt(marginHeight.marginBottom,10);

    // visible height
    const visibleHeight = $messages.offsetHeight;

    // content aka container height
    const containerHeight = $messages.scrollHeight;

    // how far I scroll (it gives us a number how far we scrolled our message container top to bottom and bottom to top)
    const farScroll = $messages.scrollTop + visibleHeight;

    if(containerHeight - messageHeight <= farScroll) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}


// bot messages and  send message to all users
socket.on("message", (message, username) => {
    const div = document.createElement("div");
    div.className = "message"
    const html = Mustache.render($messageTemplet, {
        Username: username,
        message: message.text,
        createdAt: moment(message.CreatedAt).format('h:mm:ss A')
    });
    div.innerHTML = html;
    $messages.insertAdjacentElement("beforeend", div);
    autoScroll()
})



// listen share location event
socket.on("shareLocation", (location, username) => {

    const div = document.createElement("div");
    div.className = "message"
    const html = Mustache.render($locationTemplet, {
        Username: username,
        location: location.url,
        createdAt: moment(location.CreatedAt).format('h:mm:ss A')
    });
    div.innerHTML = html;
    $messages.insertAdjacentElement("beforeend", div);
    autoScroll()
    
})

socket.on("roomData", ({ room, usersInThatRoom }) => {
    // const div = document.createElement("div");
    // div.className = "message"
    const html = Mustache.render($sideBarTemplet, {
        room,
        usersInThatRoom,
    });
    $sidebar.innerHTML = html;
})


// send geo location of the user 
locationButton.addEventListener("click", (e) => {

    if (!navigator.geolocation) {
        return alert("Your browser is not supported geolocation!");
    }
    e.target.disabled = true;

    setTimeout(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit("sendGeoLocation", position.coords.latitude, position.coords.longitude, (locationInfo) => {
                e.target.disabled = false;
                console.log(locationInfo)
            })
        })
    }, 1000);

})


// send user username and user room
socket.emit("joinUser", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
})