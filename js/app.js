var localStream, localPeerConnection, remotePeerConnection;
var servers = {"iceServers":[{"url":"stun:23.21.150.121"}]};

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
hangupButton.onclick = hangup;
joinButton.onclick = join;

sentLocalOfferButton.onclick = function() {
	showLocalOffer.style.display = 'none';
	getRemoteAnswer.style.display = 'block';
}

function trace(text) {
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

function gotStream(stream){
  trace("Received local stream");
  localVideo.src = URL.createObjectURL(stream);
  localStream = stream;
  callButton.disabled = false;
  joinButton.disabled = false;
}

function start() {
  trace("Requesting local stream");
  startButton.disabled = true;
  getUserMedia({audio:true, video:true}, gotStream,
    function(error) {
      trace("getUserMedia error: ", error);
    });
}

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
  localPeerConnection.createOffer(gotLocalDescription,handleError);
}

function gotLocalDescription(description){
  localPeerConnection.setLocalDescription(description);
  trace("Offer from localPeerConnection: \n" + description.sdp);
  localOffer.value = JSON.stringify(description);

  // localPeerConnection.onicecandidate = gotLocalIceCandidate;
}

pasteRemoteOfferButton.onclick = function() {
	getRemoteOffer.style.display = 'none';
	showLocalAnswer.style.display = 'block';
	
	var description = new RTCSessionDescription(JSON.parse(remoteOffer.value));
	remotePeerConnection.setRemoteDescription(description);

	// remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	// remotePeerConnection.onaddstream = gotRemoteStream;

	remotePeerConnection.createAnswer(gotRemoteDescription,handleError);

	// remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	// remotePeerConnection.onaddstream = gotRemoteStream;
}

function gotRemoteDescription(description){
  remotePeerConnection.setLocalDescription(description);
  trace("Answer from remotePeerConnection: \n" + description.sdp);
  localAnswer.value = JSON.stringify(description);
  // localPeerConnection.onicecandidate = gotLocalIceCandidate;
  // localPeerConnection.setRemoteDescription(description);
}

pasteRemoteAnswerButton.onclick = function() {
	getRemoteAnswer.style.display = 'none';
	console.log('yay');

	var description = new RTCSessionDescription(JSON.parse(remoteAnswer.value));
  localPeerConnection.setRemoteDescription(description);
  localPeerConnection.onicecandidate = gotLocalIceCandidate;
	// remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	// remotePeerConnection.onaddstream = gotRemoteStream;
}

sentLocalAnswerButton.onclick = function() {
	showLocalAnswer.style.display = 'none';
	console.log('success');

	// var description = new RTCSessionDescription(JSON.parse(remoteAnswer.value));
 //  localPeerConnection.setRemoteDescription(description);
 //  localPeerConnection.onicecandidate = gotLocalIceCandidate;
}

function join(){
  trace("Joining call");
  getRemoteOffer.style.display = 'block';
  callButton.disabled = true;
  hangupButton.disabled = false;
  joinButton.disabled = true;

  remotePeerConnection = new RTCPeerConnection(servers);
  trace("Created remote peer connection object remotePeerConnection");
  // remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
  // remotePeerConnection.onaddstream = gotRemoteStream;
}



function hangup() {
  trace("Ending call");
  localPeerConnection.close();
  remotePeerConnection.close();
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

function gotRemoteStream(event){
  remoteVideo.src = URL.createObjectURL(event.stream);
  trace("Received remote stream");
}

function gotLocalIceCandidate(event){
  if (event.candidate) {
    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    trace("Local ICE candidate: \n" + event.candidate.candidate);
  }
}

function gotRemoteIceCandidate(event){
  if (event.candidate) {
    localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    trace("Remote ICE candidate: \n " + event.candidate.candidate);
  }
}

function handleError(){}