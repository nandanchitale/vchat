/* Method to disply local video feed */

function addLocalVideo() {
    Twilio.Video.createLocalVideoTrack().then(track => {
        let video = document.getElementById('you');
        video.appendChild(track.attach());
    });
};

/* Method to handle connection form */
let connected = false;
const usernameInput = document.getElementById('username');
const button = document.getElementById('join_leave');
const container = document.getElementById('container')
const count = document.getElementById('count');
let room;

function connectButtonHandler(event) {
    event.preventDefault();
    if (!connected) {
        let username = usernameInput.value;
        if (!username) {
            alert("Enter username before connecting");
            return;
        }
        button.disabled = true;
        button.innerHTML = 'Connecting ...';
        connect(username).then(() => {
            button.innerHTML = 'Leave call';
            button.disabled = false;
        }).catch(() => {
            alert('Connection failed, Is backend running?');
            button.innerHTML = 'Join call';
            button.disabled = false;
        });
    }
    else {
        disconnect();
        button.innerHTML = 'Join call';
        connected = false;
    }
};

/* Method to connect to a video chat room */
function connect(username) {
    let promise = new Promise((resolve, reject) => {
        // get a token from backend
        fetch('/login', {
            method: 'POST',
            body: JSON.stringify({ 'username': username })
        }).then(res => res.json()).then(data => {
            // join video call
            return Twilio.Video.connect(data.token);
        }).then(_room => {
            room = _room;
            room.participants.forEach(participantConnected);
            room.on('participantConnected', participantConnected);
            room.on('participantDisconnected', participantDisconnected);
            connected = true;
            updateParticipantCount();
            resolve();
        }).catch(() => {
            reject();
        });
    });
    return promise;
};

/* Method to update participant count */
function updateParticipantCount() {
    if (!connected)
        count.innerHTML = 'Disconencted';
    else
        count.innerHTML = (room.participants.size + 1) + ' participants online.';
};


/* Connecting and disconnecting participants */
function participantConnected(participant) {
    let participantDiv = document.getElement('div');
    participantDiv.setAttribute('id', participant.sid);
    participantDiv.setAttribute('class', 'participant');

    let tracksDiv = document.createElement('div');
    participantDiv.appendChild(tracksDiv);

    let labelDiv = document.createElement('div');
    labelDiv.innerHTML = participant.identify;
    participantDiv.appendChild(labelDiv);

    container.appendChild(participantDiv);

    participant.tracks.forEach(publication => {
        if (publication.isSubscribed)
            trackSubscribed(tracksDiv, publication.track);
    });

    participant.on('trackSubscribed', track => trackSubscribed(tracksDiv, track));
    participant.on('trackUnsubscribed', trackUnsubscribed);

    updateParticipantCount();

};


function participantDisconnected(participant) {
    document.getElementById(participant.sid).remove();
    updateParticipantCount();
};

function trackSubscribed(div, track) {
    div.appendChild(track.attach());
};

function trackUnsubscribed(track) {
    track.detach().forEach(element => element.remove());
};

function disconnect(){
    room.disconnect();
    while (container.lastChild.id != 'local')
        container.removeChild(container.lastChild);
    
    button.innerHTML = 'Join call';
    connected = false;
    updateParticipantCount();
};

addLocalVideo()
button.addEventListener('click', connectButtonHandler);