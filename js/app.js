var localStream, localPeerConnection, remotePeerConnection;
var servers = { "iceServers": [{ "url": "stun:23.21.150.121" }] };

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
var endCallButton = document.getElementById("endCallButton");

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
joinButton.disabled = true;

hangupButton.style.display = 'none';
endCallButton.style.display = 'none';
showLocalOffer.style.display = 'none';
getRemoteOffer.style.display = 'none';
showLocalAnswer.style.display = 'none';
getRemoteAnswer.style.display = 'none';

startButton.onclick = start;
callButton.onclick = call;
joinButton.onclick = join;
hangupButton.onclick = hangup;
endCallButton.onclick = endCall;

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
  getUserMedia({ audio: true, video: true }, gotStream,
    function(error) {
      trace("getUserMedia error: ", error);
    });
}

function gotStream(stream) {
  trace("Received local stream");
  localVideo.src = URL.createObjectURL(stream);
  localStream = stream;
  callButton.disabled = false;
  joinButton.disabled = false;
}

// ALICE

function call() {
  hangupButton.style.display = 'block';
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
  localPeerConnection.createOffer(gotLocalDescription, handleError, sdpConstraints);

  localPeerConnection.onicecandidate = gotLocalIceCandidate;

}

function gotLocalDescription(description) {
  localPeerConnection.setLocalDescription(description);
  trace("Offer from localPeerConnection SDP: \n" + description.sdp);
  trace("Offer from localPeerConnection TYPE: \n" + description.type);
}

function showRemote() {
  showLocalOffer.style.display = 'none';
  getRemoteAnswer.style.display = 'block';
}

function answerRemote() {
  getRemoteAnswer.style.display = 'none';
  var remoteSesssionDescription = new RTCSessionDescription(JSON.parse(remoteAnswer.value));
  localPeerConnection.setRemoteDescription(remoteSesssionDescription);

  localPeerConnection.onaddstream = gotRemoteStream;
}

function gotLocalIceCandidate(evt) {
  if (evt.candidate == null) {
    trace("Local ICE candidate: \n" + evt);
    localOffer.value = JSON.stringify(localPeerConnection.localDescription);
  }
}

function hangup() {
  trace("Ending call");
  remoteVideo.style.display = 'none';
  hangupButton.style.display = 'none';
  startButton.disabled = false;
  callButton.disabled = true;
  joinButton.disabled = true;

  showLocalOffer.style.display = 'none';
  getRemoteOffer.style.display = 'none';
  showLocalAnswer.style.display = 'none';
  getRemoteAnswer.style.display = 'none';
}

// BOB

function join() {
  trace("Joining call");
  endCallButton.style.display = 'block';
  getRemoteOffer.style.display = 'block';
  callButton.disabled = true;
  hangupButton.style.display = 'none';
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
  remotePeerConnection.createAnswer(gotRemoteDescription, handleError, sdpConstraints);

  remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
}

function gotRemoteDescription(answerSdp) {
  remotePeerConnection.setLocalDescription(answerSdp);
  trace("Answer from remotePeerConnection SDP: \n" + answerSdp.sdp);
  trace("Answer from remotePeerConnection TYPE: \n" + answerSdp.type);
}

function hideRemoteAnswer() {
  showLocalAnswer.style.display = 'none';
}

function gotRemoteStream(evt) {
  remoteVideo.src = URL.createObjectURL(evt.stream);
  trace("Received remote stream");
}

function gotRemoteIceCandidate(evt) {
  if (evt.candidate) {
    trace("Remote ICE candidate: \n " + evt);
    localAnswer.value = JSON.stringify(remotePeerConnection.localDescription);
  }
}

function endCall() {
  trace('Ending Call');
  endCallButton.style.display = 'none';
  startButton.disabled = false;
  localVideo.style.display = 'none';
  showLocalOffer.style.display = 'none';
  getRemoteOffer.style.display = 'none';
  showLocalAnswer.style.display = 'none';
  getRemoteAnswer.style.display = 'none';
}

function handleError() {
  trace("Cannot Create Offer");
}
