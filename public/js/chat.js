const socket = io()

//ELements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $usersList = document.querySelector('#users_list')

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const messageInfoTemplate = document.querySelector("#info-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML


//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix : true})

const autoscroll = ()=>{
    //new message element
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
    

}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        sender:message.username,
        message:message.text,
        createdAt: moment(message.createAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('messageInfo', (message) => {
    console.log(message)
    const html = Mustache.render(messageInfoTemplate,{
        sender:message.username,
        message:message.text,
        createdAt: moment(message.createAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (props) => {
    console.log(props)
    const html = Mustache.render(locationMessageTemplate,{
        username:props.username,
        url:props.url,
        createdAt: moment(props.createAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', (props) => {
    console.log(props)
    const html = Mustache.render(sidebarTemplate,{
        room:props.room,
        users:props.users
    })
    $usersList.innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    //disable submit button to prevent multiple click before 
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    const message = e.target.elements.message.value

    if ($messageFormInput.value.trim().length === 0){
        console.log('Input is empty');
        $messageFormInput.placeholder = 'Message cant be empty'
        
        
        setTimeout(() => {
            $messageFormInput.placeholder = 'Message'
            $messageFormButton.removeAttribute('disabled')
        }, 1500);

        $messageFormInput.focus()

        return
    }

    socket.emit('sendMessage', message, (error)=>{
        $messageFormInput.value = ''
        $messageFormInput.focus()

        setTimeout(() => {
            $messageFormButton.removeAttribute('disabled')
        }, 1500);
        
        //this is callback
        if(error){
            console.log(error);
        }
        console.log('ACK:The message was delivered');
    })
})


$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('You are using ancient browser, geolocation is not supported. Upgrade your browser and retry again!')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            console.log('Location shared');
            $sendLocationButton.removeAttribute('disabled')
        })
    })

})


socket.emit('join',{username, room}, (error)=>{
    console.log(error);
    if(error){
        alert(error)
        location.href="/"
    }
})