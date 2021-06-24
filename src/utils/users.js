const users = []

//add user, remove user, get user, get user rooom
const addUser=({id, username, room})=>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return{
            error:'Username and room are required!'
        }
    }

    //check existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    
    if(existingUser){
        return{
            error:'Username is in use!'
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)

    return { user }

}

const removeUser = (id) =>{
    const index = users.findIndex((user) => user.id === id)
    
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id===id)
}

const getUsersInRoom = (room)=>{
    return users.filter((user)=> user.room === room)
}

module.exports ={
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
}


//test ---------------------------------------------------
// addUser({
//     id:11,
//     username:'adam',
//     room:'smktm'
// })


// addUser({
//     id:22,
//     username:'pami',
//     room:'sktm'
// })

// addUser({
//     id:33,
//     username:'iris',
//     room:'sktm'
// })

// console.log(getUser(33))
// console.log(getUserInRoom('sktm'))

// addUser({
//     id:99,
//     username:'adam',
//     room:'sktm'
// })


// let res=addUser({
//     id:33,
//     username:'iris  ',
//     room:'     adsad'
// })
// console.log(res);

// res = addUser({
//     id:55,
//     username:'adam',
//     room:'sktm'
// })
// console.log(res);

// res = addUser({
//     id:77,
//     username:'',
//     room:''
// })
// console.log(res);

// console.log(users)

// console.log('try to remove user 99');
// const removedUser = removeUser(99)
// console.log(removedUser);
// console.log(users);


