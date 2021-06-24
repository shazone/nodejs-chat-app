const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//---SOCKET.IO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
io.on('connection', (socket) => {
            console.log('New WebSocket connection')

            socket.on('join',(userInfo, callback) =>{
                const {error, user} = addUser({id:socket.id, ...userInfo})    //... spread operator or we can also use deconstruct method {prop1, prop2}

                if(error){
                    return callback(error) //below will not executed if error.
                }

                socket.join(user.room)

                socket.emit('messageInfo', generateMessage('System',`Welcome to Chat App [${user.username}], hope you enjoy while staying here`))
                socket.broadcast.to(user.room).emit('messageInfo',generateMessage('System',`${user.username} has joined!`)) //broadcast to everybody expect this socket.

                io.to(user.room).emit('roomData',{
                    room:user.room,
                    users:getUsersInRoom(user.room)
                })


                callback()
            })    

            socket.on('sendMessage', (message, callback) => {
                const user = getUser(socket.id)
                const filter = new Filter()
                
                if(filter.isProfane(message)){
                    return callback('bad words are not allowed!')
                }

                io.to(user.room).emit('message', generateMessage(user.username,message)) //broadcast to everybody
                callback('Delivered')
            })

            socket.on('sendLocation',(coords, callback)=>{
                const user = getUser(socket.id)
                io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?${coords.latitude},${coords.longitude}`))
                callback('Location Delivered')
            })

            socket.on('disconnect',()=>{
                const user = removeUser(socket.id)

                if(user){
                    io.to(user.room).emit('messageInfo',generateMessage(`${user.username} has left!`))
                    io.to(user.room).emit('roomData',{
                        room:user.room,
                        users: getUsersInRoom(user.room)
                    })
                }
                
            })

})
//---SOCKET.IO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})

