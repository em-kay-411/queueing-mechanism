const express = require('express')
const app = express()
const http = require('http')
const socketIO = require('socket.io')
const cookieParser = require('cookie-parser')
const cors = require('cors')
app.use(cookieParser())
app.use(cors({
    origin : 'http://localhost:3000',
    credentials : true
}))

const users_connected = ['23456', '2345', '1234'] 
const real_time_queue = [ '8308665701495339', '5034188041571646', '11120453856058132' ]
const endless_queue = []

const performChecks = (req, res, next) => {
    if(req.cookies && req.cookies.id){
        if(users_connected.includes(req.cookies.id))
        {
            console.log('user connceted')
            return next()
        }
        return next()
    }

    if(users_connected.length < 3 && real_time_queue.length === 0 && endless_queue.length === 0){
        let randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        users_connected.push(randomNumber)
        res.cookie('id',randomNumber, { maxAge: 1000 * 60 * 2, httpOnly: true });

        console.log('users connected', users_connected);
        console.log('real time queue', real_time_queue);
        console.log('endless queue', endless_queue)
        return next()
    }

    if(users_connected.length === 3 && real_time_queue.length <  3 && endless_queue.length === 0){
        let randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        real_time_queue.push(randomNumber)
        res.cookie('id',randomNumber, { maxAge: 1000 * 60 * 1440, httpOnly: true });

        console.log('users connected', users_connected);
        console.log('real time queue', real_time_queue);
        console.log('endless queue', endless_queue)
        return res.status(200).send({message:'access_denied', queue:'real_time', action : 'setup-socket'});
    }

    if(users_connected.length === 3 && real_time_queue.length === 3){
        let randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        endless_queue.push(randomNumber)
        res.cookie('id',randomNumber, { maxAge: 1000 * 60 * 1440, httpOnly: true });

        console.log('users connected', users_connected);
        console.log('real time queue', real_time_queue);
        console.log('endless queue', endless_queue)
        return res.status(200).send({message:'access_denied', queue:'endless'});
    }

    next()
}

app.use(performChecks)

const server = http.createServer(app)

const io = new socketIO.Server(server, {
    cors:{
        origin: '*'
    }
})


io.on('connection', (socket) => {
    console.log('Client connected : ', socket.id)
})

app.get('/', (req, res, next) => {
    console.log('users connected', users_connected);
    console.log('real time queue', real_time_queue);
    console.log('endless queue', endless_queue)
    return res.status(200).send({message : 'access_granted', userCount : users_connected.length})
})

app.get('/push-queue', (req, res, next) => {
    console.log('users connected', users_connected);
    console.log('real time queue', real_time_queue);
    console.log('endless queue', endless_queue)
    console.log('push-queue/')
    users_connected.shift()

    let user = real_time_queue.shift()
    users_connected.push(user);

    user = endless_queue.shift();
    real_time_queue.push(user);

    io.emit('queue-position-update');
    console.log('users connected', users_connected);
    console.log('real time queue', real_time_queue);
    console.log('endless queue', endless_queue)
    res.status(200).send({message : 'success'})    
})

app.get('/position-update', (req, res, next) => {
    console.log('users connected', users_connected);
    console.log('real time queue', real_time_queue);
    console.log('endless queue', endless_queue)
    const user = req.cookies.id;

    if(users_connected.includes(user)){
        return res.status(200).send({message : 'full-access-granted'})
    }

    if(real_time_queue.includes(user)){
        const position = real_time_queue.indexOf(user);
        if(position === real_time_queue.length - 1){
            return res.status(200).send({message : 'shifted_to_real_time_queue', queueNo : position + 1})
        }
        return res.status(200).send({message : 'real_time_queue', queueNo : position + 1})
    }

    if(endless_queue.includes(user)){
        const position = real_time_queue.length + endless_queue.indexOf(user) + 1;
        return res.status(200).send({message : 'endless_queue', queueNo : position})
    }
})

server.listen('8000', () => {
    console.log('server listening')
})