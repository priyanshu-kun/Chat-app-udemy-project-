const users = [];

const addUser = ({ id,username,room }) => {


    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate data
    if(!username || !room) {
        return {
            error: "Username and rooms must be required!"
        }
    }

    // check existing user
    const unique = users.find(user => {
        return user.room === room && user.username === username
    })

    if(unique) {
        return {
            error: "username must be unique"
        }
    }

    const user = {id,username,room};
    users.push(user);
    return {user};

}

const removeUser = (id) => {
    const removeUserIndex = users.findIndex(user => user.id === id)
    if(removeUserIndex !== -1) {
        return users.splice(removeUserIndex,1)[0];
    }

}

const getUser = (id) => {
    return  users.find(user => user.id === id)
}


const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}