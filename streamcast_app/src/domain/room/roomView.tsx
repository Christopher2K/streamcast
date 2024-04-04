/* @refresh reload */
import { For, Match, Switch, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Socket } from "phoenix";

import { Box } from "#style/jsx";

import { Room } from "#root/services/api";

import { useAuthContext } from "#root/domain/auth/authProvider";
import { User } from "#root/domain/auth/types";
import {
  startCall,
  answerCall,
  type PeerChannelEvents,
  type PeerChannelPushEvents,
  type RoomChannelEvents,
  type RoomChannelPushEvents,
} from "#root/domain/call";

import { useRoomContext } from "./roomProvider";

export function RoomView() {
  const roomCtx = useRoomContext();
  const authCtx = useAuthContext();

  return (
    <Switch>
      <Match when={roomCtx.state.room === undefined}>Loading</Match>
      <Match when={roomCtx.state.room === null}>This room doesn't exit</Match>
      <Match when={roomCtx.state.room}>
        {(room) => <ActiveRoom room={room()} user={authCtx.state.user!} />}
      </Match>
    </Switch>
  );
}

type ActiveRoomProps = {
  room: Room;
  user: User;
};

function ActiveRoom(props: ActiveRoomProps) {
  // Constants
  let _userVideoBox: HTMLVideoElement | undefined;
  const localStream = new MediaStream();
  const socket = new Socket("ws://localhost:4000/socket/room", {
    params: { userId: props.user.id },
  });
  let peerChannel: TypeSafeChannel<
    PeerChannelEvents,
    PeerChannelPushEvents
  > | null = null;
  let roomChannel: TypeSafeChannel<
    RoomChannelEvents,
    RoomChannelPushEvents,
    RoomChannelEvents["presence:update"]
  > | null = null;
  const [peersData, setPeersData] = createStore<{
    peerIds: string[];
    data: Record<
      string,
      | {
          pc: RTCPeerConnection;
          iceCandidates: Array<RTCIceCandidate>;
          remoteStream: MediaStream;
        }
      | undefined
    >;
  }>({ peerIds: [], data: {} });

  // Getters
  const userVideoBox = () => {
    if (_userVideoBox) {
      return _userVideoBox;
    }
    throw new Error("Video element accessed before intialization");
  };

  const getPeersIds = () => {
    return Object.keys(peersData.data);
  };

  // Functions
  async function initUserVideo() {
    // FIX ME: START LOADING VIDEO
    const videoBox = userVideoBox();
    videoBox.srcObject = localStream;

    const userMedia = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    userMedia.getTracks().forEach((track) => localStream.addTrack(track));
    await videoBox.play();
    // FIX ME: STOP LOADING INDICATOR
  }

  async function initPeerChannel() {
    if (!socket.isConnected) throw new Error("SOCKET_NOT_CONNECTED");
    const baseChannel = socket.channel("peer:" + props.user.id);
    peerChannel = baseChannel;
    peerChannel.join().receive("ok", () => {
      // To make TS happy
      if (!peerChannel) return;

      console.debug("✅ Connected to peer channel.", props.user.id);
      peerChannel.on("rtc:offer:received", onOfferReceived);
      peerChannel.on("rtc:answer:received", onAnswerReceived);
      peerChannel.on("rtc:ice_candidate:received", onIceCandidateReceived);
    });
  }

  async function initRoomChannel() {
    if (!socket.isConnected) throw new Error("SOCKET_NOT_CONNECTED");
    const baseChannel = socket.channel("room:" + props.room.id);
    roomChannel = baseChannel;
    roomChannel
      .join()
      .receive("ok", (data) => {
        // To make TS happy
        if (!roomChannel) return;

        console.debug("✅ Connected to room channel.");
        console.debug("🫂 Room presence", data);
        const peersIds = Object.keys(data);
        onRoomJoined(peersIds);
      })
      .receive("error", console.log);

    roomChannel.on("presence:left", ({ userId }) => {
      console.debug(`👋  ${userId} left the room.`);
      const peerData = peersData.data[userId];
      if (peerData) {
        setPeersData("data", userId, undefined);
      }
    });
  }

  // Callbacks
  async function onOfferReceived(
    data: PeerChannelEvents["rtc:offer:received"],
  ) {
    console.debug("❗ Received an offer from ", data.from);
    const { remoteStream, peerConnection, answerSDP } = await answerCall(
      localStream,
      (candidate) =>
        roomChannel?.push("rtc:ice_candidate", {
          candidate: candidate.toJSON(),
          to: data.from,
        }),
      { sdp: data.sdp, type: data.type },
    );

    setPeersData("data", data.from, {
      pc: peerConnection,
      iceCandidates: [],
      remoteStream,
    });

    console.debug("❗ Sending an answer to", data.from);
    roomChannel?.push("rtc:answer", {
      type: answerSDP.type,
      sdp: answerSDP.sdp,
      to: data.from,
    });
  }

  async function onAnswerReceived(
    data: PeerChannelEvents["rtc:answer:received"],
  ) {
    console.debug("❗ Received an answer from ", data.from);
    const peerData = peersData.data[data.from];
    if (!peerData) throw new Error("Not peers data available for this answer");
    await peerData.pc.setRemoteDescription(
      new RTCSessionDescription({ sdp: data.sdp, type: data.type }),
    );
  }

  async function onIceCandidateReceived(
    data: PeerChannelEvents["rtc:ice_candidate:received"],
  ) {
    const peerData = peersData.data[data.from];
    if (peerData) {
      await peerData.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else {
      console.warn("⚠️  Candidate received before having the data in");
      // TODO: KEEP THE CANDIDATE SOMEWHERE UNTIL THE PC IS AVAILABLE
    }
  }

  async function onRoomJoined(peersIds: string[]) {
    peersIds.forEach(async (id) => {
      const { offerSDP, peerConnection, remoteStream } = await startCall(
        localStream,
        (candidate) => {
          roomChannel?.push("rtc:ice_candidate", {
            candidate: candidate.toJSON(),
            to: id,
          });
        },
      );

      setPeersData("data", id, {
        pc: peerConnection,
        iceCandidates: [],
        remoteStream,
      });

      console.debug("❗ Sending an offer to ", id);
      roomChannel?.push("rtc:offer", {
        type: offerSDP.type,
        sdp: offerSDP.sdp,
        to: id,
      });
    });
  }

  async function onPeerAdded(rootElement: HTMLElement, id: string) {
    const data = peersData.data[id];
    if (!data) throw new Error("Cannot set the video for undefined peer data");
    const peerVideoElement = document.createElement("video");
    peerVideoElement.srcObject = data.remoteStream;
    peerVideoElement.classList.add("peer-video");
    rootElement.append(peerVideoElement);
    await peerVideoElement.play();
  }

  // Lifecycle
  onMount(async () => {
    socket.connect();
    await initUserVideo();
    await initPeerChannel();
    await initRoomChannel();
  });

  onCleanup(async () => {
    peerChannel?.leave();
    socket.disconnect();
  });

  return (
    <Box w="full" display="grid" gridTemplateColumns="1fr 1fr">
      <Box aspectRatio="16/9" w="full" backgroundColor="red">
        <video class="peer-video" ref={_userVideoBox}></video>
      </Box>
      <For each={getPeersIds()}>
        {(id) => (
          <Box
            aspectRatio="16/9"
            w="full"
            backgroundColor="green"
            ref={(ref) => onPeerAdded(ref, id)}
          ></Box>
        )}
      </For>
    </Box>
  );
}
