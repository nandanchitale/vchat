function addLocalVideo() {
    Twilio.Video.createLocalVideoTrack().then(track => {
        let video = document.getElementById('you');
        video.appendChild(track.attach());
    });
};

addLocalVideo();