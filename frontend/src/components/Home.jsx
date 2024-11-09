import { useEffect, useState } from "react";
import { io } from 'socket.io-client'
import { useNavigate } from "react-router-dom";
let socket = null;

function Home () {
    const [timer, setTimer] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://localhost:8000/', {
                credentials : 'include'
            })
            const json = await response.json()

            console.log(json)

            if(!localStorage.getItem('start-time') && json.message === 'access_granted'){
                console.log('here');
                localStorage.setItem('start-time', Date.now())   
            }

            if(json.queue === 'real_time'){
                navigate('/waiting')
            }

            if(json.queue === 'endless'){
                navigate('/waiting')
            }
        }

        fetchData();       

        setTimer(true);
    }, [])

    useEffect(() => {
        
        if(timer){
            const currentTime = Date.now();
            const startTime = localStorage.getItem('start-time');
            console.log('start time', startTime)
            const elapsedTime = currentTime - startTime
            const remainingTime = Math.max(110000 - elapsedTime, 0);
            console.log(elapsedTime);

            setTimeout(() => {
                console.log("10 seconds remaining");
                sendRequest()
                localStorage.clear()
                
            }, remainingTime);
        }

        const sendRequest = async() => {
            const response = await fetch('http://localhost:8000/push-queue', {
                credentials:'include'
            })

            const json = await response.json()
            if(json.message === 'success'){
                window.location.reload()
            }
        }
    }, [timer])

    return (
        <h1 style={{fontSize : '2rem'}} className="welcome">
            Welcome to the Application
        </h1>
    )
}

export default Home;