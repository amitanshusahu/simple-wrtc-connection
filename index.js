const myVideo = document.getElementById('my-video');
const recivedVideo = document.getElementById('video');
const browser1 = new RTCPeerConnection(); // sender
const browser2 = new RTCPeerConnection(); // reciver 


function start() {
  navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    .then(stream => {
      myVideo.srcObject = stream;
      stream.getTracks().forEach(track => browser1.addTrack(track, stream));
    })
    .catch(ex => {
      console.log(ex);
    });
}


browser1.onicecandidate = e => {
  console.log('browser1.onicecandidate:', e.candidate);
  browser2.addIceCandidate(e.candidate)
    .catch(e => console.log(e));
};
browser2.onicecandidate = e => {
  console.log('browser2.onicecandidate:', e.candidate);
  browser1.addIceCandidate(e.candidate)
    .catch(e => console.log(e));
};


browser1.oniceconnectionstatechange = e => console.log("browser1.iceConnState:", browser1.iceConnectionState);
browser2.oniceconnectionstatechange = e => console.log("browser2.iceConnState:", browser2.iceConnectionState);


browser1.onnegotiationneeded = e => {
  browser1.createOffer().then(d => {
    console.log("browser1.offer_sdp:", d.sdp);
    return browser1.setLocalDescription(d);
  })
    .then(() => browser2.setRemoteDescription(browser1.localDescription))
    .then(() => browser2.createAnswer())
    .then(d => {
      console.log("browser2.answer_sdp:", d.sdp);
      return browser2.setLocalDescription(d);
    })
    .then(() => browser1.setRemoteDescription(browser2.localDescription))
    .catch(console.error);
};


browser2.ontrack = e => {
  recivedVideo.srcObject = e.streams[0];
  recivedVideo.play();
}
