

document.getElementById('mainGif').addEventListener('mouseover', _ => {
});

document.getElementById('exitButton').addEventListener('click', _ => {
    console.log("exit clicked");
    window.api.send("exitButton-clicked");
});

