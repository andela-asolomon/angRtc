var localStream, localPeerConnection, remotePeerConnection;
var servers = {"iceServers":[{"url":"stun:23.21.150.121"}]};

var sdpConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

var localVideo = document.getElementById("alice");
var remoteVideo = document.getElementById("bob");

var startButton = document.getElementById("startButton");
var callButton = document.getElementById("callButton");
var hangupButton = document.getElementById("hangupButton");
var joinButton = document.getElementById("joinButton");

var localOffer = document.getElementById("localOffer");
var remoteOffer = document.getElementById("remoteOffer");
var localAnswer = document.getElementById("localAnswer");
var remoteAnswer = document.getElementById("remoteAnswer");

var showLocalOffer = document.getElementById("showLocalOffer");
var getRemoteOffer = document.getElementById("getRemoteOffer");
var showLocalAnswer = document.getElementById("showLocalAnswer");
var getRemoteAnswer = document.getElementById("getRemoteAnswer");

var sentLocalOfferButton = document.getElementById("sentLocalOfferButton");
var pasteRemoteOfferButton = document.getElementById("pasteRemoteOfferButton");
var sentLocalAnswerButton = document.getElementById("sentLocalAnswerButton");
var pasteRemoteAnswerButton = document.getElementById("pasteRemoteAnswerButton");

startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;
joinButton.disabled = true;

showLocalOffer.style.display = 'none';
getRemoteOffer.style.display = 'none';
showLocalAnswer.style.display = 'none';
getRemoteAnswer.style.display = 'none';

startButton.onclick = start;
callButton.onclick = call;
joinButton.onclick = join;
hangupButton.onclick = hangup;
sentLocalOfferButton.onclick = showRemote;
pasteRemoteOfferButton.onclick = answerCreate;
pasteRemoteAnswerButton.onclick = answerRemote;
sentLocalAnswerButton.onclick = hideRemoteAnswer;

function trace(text) {
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

function start() {
  trace("Requesting local stream");
  startButton.disabled = true;
  getUserMedia({audio:true, video:true}, gotStream,
    function(error) {
      trace("getUserMedia error: ", error);
    });
}

function gotStream(stream){
  trace("Received local stream");
  localVideo.src = URL.createObjectURL(stream);
  localStream = stream;
  callButton.disabled = false;
  joinButton.disabled = false;
}

// ALICE

function call() {
	showLocalOffer.style.display = 'block';
	callButton.disabled = true;
	joinButton.disabled = true;
	hangupButton.disabled = false;
	trace("Starting call");

	if (localStream.getVideoTracks().length > 0) {
	  trace('Using video device: ' + localStream.getVideoTracks()[0].label);
	}
	if (localStream.getAudioTracks().length > 0) {
	  trace('Using audio device: ' + localStream.getAudioTracks()[0].label);
	}

	localPeerConnection = new RTCPeerConnection(servers);
	trace("Created local peer connection object localPeerConnection");

	localPeerConnection.addStream(localStream);
	trace("Added localStream to localPeerConnection");
	localPeerConnection.createOffer(gotLocalDescription,handleError,sdpConstraints);

  localPeerConnection.onicecandidate = gotLocalIceCandidate;
	
}

function gotLocalDescription(description){
  localPeerConnection.setLocalDescription(description);
  trace("Offer from localPeerConnection SDP: \n" + description.sdp);
  trace("Offer from localPeerConnection TYPE: \n" + description.type);
  // localOffer.value = JSON.stringify(description);
}

function showRemote() {
	showLocalOffer.style.display = 'none';
	getRemoteAnswer.style.display = 'block';
}

function answerRemote() {
  getRemoteAnswer.style.display = 'none';
	var remoteSesssionDescription = new RTCSessionDescription(JSON.parse(remoteAnswer.value));
	localPeerConnection.setRemoteDescription(remoteSesssionDescription);
}


function gotLocalIceCandidate(evt){
  if (evt.candidate == null) {
    // localPeerConnection.addIceCandidate(new RTCIceCandidate(evt.candidate));
    trace("Local ICE candidate: \n" + evt);
    localOffer.value = JSON.stringify(localPeerConnection.localDescription);
  }
}


// BOB

function join() {
	trace("Joining call");
	getRemoteOffer.style.display = 'block';
	callButton.disabled = true;
	hangupButton.disabled = false;
	joinButton.disabled = true;

	remotePeerConnection = new RTCPeerConnection(servers);
	trace("Created remote peer connection object remotePeerConnection");

	remotePeerConnection.onaddstream = gotRemoteStream;
}

function answerCreate() {
	getRemoteOffer.style.display = 'none';
	showLocalAnswer.style.display = 'block';

	var sessionDescription = new RTCSessionDescription(JSON.parse(remoteOffer.value));
	remotePeerConnection.setRemoteDescription(sessionDescription);
	remotePeerConnection.createAnswer(gotRemoteDescription,handleError,sdpConstraints);

	remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
}

function gotRemoteDescription(answerSdp) {
	remotePeerConnection.setLocalDescription(answerSdp);
	trace("Answer from remotePeerConnection SDP: \n" + answerSdp.sdp);
	trace("Answer from remotePeerConnection TYPE: \n" + answerSdp.type);
	// localAnswer.value = JSON.stringify(answerSdp);
}

function hideRemoteAnswer() {
	showLocalAnswer.style.display = 'none';
}

function gotRemoteStream(evt) {
	console.log('evt: ', evt);
	remoteVideo.src = URL.createObjectURL(evt.stream);
	trace("Received remote stream");
}

function gotRemoteIceCandidate(evt) {
	if (evt.candidate) {
	  // remotePeerConnection.addIceCandidate(new RTCIceCandidate(evt.candidate));
	  trace("Remote ICE candidate: \n " + evt);
	  localAnswer.value = JSON.stringify(remotePeerConnection.localDescription);
	}
}

// GENERAL USE

function hangup() {
  trace("Ending call");
  localPeerConnection = null;
  remotePeerConnection = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
  joinButton.disabled = false;

  showLocalOffer.style.display = 'none';
  getRemoteOffer.style.display = 'none';
  showLocalAnswer.style.display = 'none';
  getRemoteAnswer.style.display = 'none';
}

function handleError(){
	trace("Cannot Create Offer");
}

function onsignalingstatechange(state) {
  trace('signaling state change:', state);
}

function oniceconnectionstatechange(state) {
  trace('ice connection state change:', state);
}

function onicegatheringstatechange(state) {
  trace('ice gathering state change:', state);
}