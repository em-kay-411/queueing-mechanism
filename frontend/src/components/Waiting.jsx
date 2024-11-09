import { useState, useEffect } from "react"
import { io } from 'socket.io-client'
import { useNavigate } from "react-router-dom";
let socket = null;

function Waiting () {

    const [noOfUsers, setNoOfUsers] = useState(0)
    const [polling, setPolling] = useState(false);
    const navigate = useNavigate();

    const setUpSocketConnection = () => {
        socket = io('http://localhost:8000/');

        socket.on('queue-position-updated', async () => {
            console.log('queue-position-update-event-received')
            await sendRequest()
        })
    }

    const sendRequest = async () => {
        const response = await fetch('http://localhost:8000/position-update', {
            credentials:'include'
        })

        const json = await response.json()

        if(json.message === 'full-access-granted'){
            navigate('/')
        }

        if(json.message === 'shifted_to_real_time_queue'){
            setUpSocketConnection();
            setPolling(false)
            setNoOfUsers(json.queueNo);
        }

        if(json.message === 'endless_queue'){
            setNoOfUsers(json.queueNo);
            setPolling(true)
        }
    }

    useEffect(() => {        
        sendRequest()

        const interval = setInterval(() => {
            if(polling){
                sendRequest()
            }            
        }, 3000)

        return () => {
            clearInterval(interval)
        }
    })

    return (
        <>
            <h1 className="wait">You are placed in the queue</h1>
            <p className="users"> {`${noOfUsers}`} ahead of you </p>
        </>        
    )
}

export default Waiting;