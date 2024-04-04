export type PeerChannelEvents = {
  "rtc:offer:received": {
    /**
     *  User ID of the user who sent the offer
     */
    from: string;
    sdp: string;
    type: RTCSdpType;
  };

  "rtc:answer:received": {
    /**
     *  User ID of the user who responded to the offer
     */
    from: string;
    sdp: string;
    type: RTCSdpType;
  };

  "rtc:ice_candidate:received": {
    from: string;
    candidate: Object;
  };
};

export type PeerChannelPushEvents = {};

export type RoomChannelEvents = {
  "presence:joined": { userId: string };
  "presence:left": { userId: string };
  "presence:update": Record<
    string,
    { metas: [{ phx_ref: string; onlineAt: number }] }
  >;
};

export type RoomChannelPushEvents = {
  "rtc:offer": {
    to: string;
    sdp?: string;
    type: string;
  };
  "rtc:answer": {
    to: string;
    sdp?: string;
    type: string;
  };
  "rtc:ice_candidate": {
    to: string;
    candidate: Object;
  };
};

const RTC_CONFIG = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export async function startCall(
  localStream: MediaStream,
  onIceCandidate: (candidate: RTCIceCandidate) => void,
) {
  // Instanciate a PC object that will symbolize
  // the connection between 2 peers
  const peerConnection = new RTCPeerConnection(RTC_CONFIG);

  // Add the local media stream (Audio + Camera) to the PC
  localStream
    .getTracks()
    .forEach((tracks) => peerConnection.addTrack(tracks, localStream));

  // Listen to valid ice candidate given by the TURN server
  peerConnection.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  });

  // Create a remote stream to stream peer's video and add it to the PC
  const remoteStream = new MediaStream();
  peerConnection.addEventListener("track", (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  });

  // Create an offer (the thing that initiate the peer call) containing
  // informations about the stream (format, codec, etc...)
  const offerSDP = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerSDP);

  return {
    peerConnection,
    remoteStream,
    offerSDP,
  };
}

export async function answerCall(
  localStream: MediaStream,
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  offerDescription: {
    sdp: string;
    type: RTCSdpType;
  },
) {
  // Instanciate a PC object that will symbolize
  // the connection between 2 peers
  const peerConnection = new RTCPeerConnection(RTC_CONFIG);

  // Add the local media stream (Audio + Camera) to the PC
  localStream
    .getTracks()
    .forEach((tracks) => peerConnection.addTrack(tracks, localStream));

  // Listen to valid ice candidate given by the TURN server
  peerConnection.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  });

  // Create a remote stream to stream peer's video and add it to the PC
  const remoteStream = new MediaStream();
  peerConnection.addEventListener("track", (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  });

  // Construct a the session description caller from the caller
  // and add it to the PC
  const offerSDP = new RTCSessionDescription(offerDescription);
  await peerConnection.setRemoteDescription(offerSDP);

  // Create an answer description to send to the caller for them to get
  // the media tracks
  const answerSDP = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerSDP);

  return {
    peerConnection,
    remoteStream,
    answerSDP,
  };
}
