/* @refresh reload */
import { Match, Switch, createEffect, onCleanup, onMount } from "solid-js";
import { Channel, Socket } from "phoenix";

import { Room } from "#root/services/api";

import { useRoomContext } from "./roomProvider";
import { useAuthContext } from "../auth/authProvider";
import { User } from "../auth/types";
import { Box, VStack } from "#style/jsx";

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

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

function ActiveRoom(props: ActiveRoomProps) {
  let localStream: MediaStream | null = null;
  let localVideo: HTMLVideoElement | undefined;
  let remoteVideo: HTMLVideoElement | undefined;

  const rtcConnections: Record<
    string,
    {
      iceCandidates: Array<Object>;
      pc: RTCPeerConnection;
      remoteStream: MediaStream;
    }
  > = {};

  const socket = new Socket("ws://localhost:4000/socket/room", {
    params: { userId: props.user.id },
  });

  async function onNewPeer(userId: string, channel: Channel) {
    const pc = new RTCPeerConnection(servers);
    if (localStream) {
      localStream?.getTracks().forEach((tracks) => {
        pc.addTrack(tracks, localStream!);
      });
    }
    const remoteStream = new MediaStream();

    if (remoteVideo) {
      remoteVideo.srcObject = remoteStream;
      remoteVideo.play();
    }

    rtcConnections[userId] = {
      remoteStream,
      iceCandidates: [],
      pc,
    };

    pc.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        channel.push("rtc:ice_candidate", {
          to: userId,
          candidate: event.candidate.toJSON(),
        });
      }
    });

    pc.addEventListener("track", (event) => {
      console.log("TRACK CALLER", event);
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    });

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    channel.push("rtc:offer", {
      to: userId,
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    });
  }

  onMount(async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideo) {
      localVideo.srcObject = localStream;
      localVideo.play();
    }

    socket.connect();
    const channel = socket.channel("room:" + props.room.id);
    const peerChannel = socket.channel("peer:" + props.user.id);

    peerChannel.join().receive("ok", () => {
      console.log("Connected to peer channel");
    });

    channel
      .join()
      .receive("ok", (response: Record<string, { meta: unknown }>) => {
        const ids = Object.keys(response).filter((id) => id !== props.user.id);
        ids.forEach((id) => onNewPeer(id, channel));
      });

    channel.on("presence:joined", (e) => console.log("joined", e));
    channel.on("presence:left", ({ userId }: { userId: string }) => {
      const peerData = rtcConnections[userId];
      if (peerData) {
        peerData.pc.close();
        if (remoteVideo) {
          remoteVideo.srcObject = null;
        }
      }
    });
    peerChannel.on(
      "rtc:offer:received",
      async ({
        from,
        sdp,
        type,
      }: {
        from: string;
        sdp: string;
        type: string;
      }) => {
        const pc = new RTCPeerConnection(servers);
        if (localStream) {
          localStream?.getTracks().forEach((tracks) => {
            pc.addTrack(tracks, localStream!);
          });
        }
        const remoteStream = new MediaStream();

        if (remoteVideo) {
          remoteVideo.srcObject = remoteStream;
          remoteVideo.play();
        }

        rtcConnections[from] = {
          remoteStream,
          iceCandidates: [],
          pc,
        };

        pc.addEventListener("track", (event) => {
          console.log("TRACK ANSWER", event);
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
        });

        pc.addEventListener("icecandidate", (event) => {
          if (event.candidate) {
            channel.push("rtc:ice_candidate", {
              to: from,
              candidate: event.candidate.toJSON(),
            });
          }
        });

        await pc.setRemoteDescription(new RTCSessionDescription({ sdp, type }));
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        channel.push("rtc:answer", {
          to: from,
          sdp: answerDescription.sdp,
          type: answerDescription.type,
        });
      },
    );

    peerChannel.on(
      "rtc:answer:received",
      ({ from, sdp, type }: { from: string; sdp: string; type: string }) => {
        const peerInfo = rtcConnections[from];
        const answerDescription = new RTCSessionDescription({ sdp, type });
        peerInfo.pc.setRemoteDescription(answerDescription);
      },
    );

    peerChannel.on(
      "rtc:ice_candidate:received",
      ({ from, candidate }: { from: string; candidate: Object }) => {
        const peerInfo = rtcConnections[from];
        if (peerInfo?.pc.remoteDescription) {
          console.log("Adding ice candidates");
          if (peerInfo.iceCandidates.length > 0) {
            peerInfo.iceCandidates.forEach((c) =>
              peerInfo.pc.addIceCandidate(c),
            );
          }
          peerInfo.iceCandidates = [];

          peerInfo.pc.addIceCandidate(candidate);
        } else {
          peerInfo.iceCandidates.push(candidate);
        }
      },
    );
  });

  onCleanup(() => {
    socket.disconnect();
  });

  return (
    <VStack w="full">
      <Box w="full" h="300px">
        <video ref={localVideo} autoplay></video>
        <video ref={remoteVideo} autoplay></video>
      </Box>
    </VStack>
  );
}
