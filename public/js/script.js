const socket = io();

if(navogator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const {latitude, longitude} = position.coords;
    socket.emit("send-location", {latitude,longitude});

    },(error)=>{
        console.error(error);
    });
}
