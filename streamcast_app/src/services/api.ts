import ky from "ky";

// DOMAIN TYPES
export type Peer = {
  id: string;
  name: string;
  offerCandidate?: string;
  answerCandidate?: string;
};

export type Room = {
  id: string;
  name: string;
  peers: Array<Peer>;
};

export type User = {
  id: string;
  name: string;
};

const client = ky.extend({
  prefixUrl: "http://localhost:4000/api",
});

export function login(name: string): Promise<User> {
  return client.post("auth/login", { json: { name } }).json();
}

export function createRoom(name: string): Promise<Room> {
  return client.post("room", { json: { name } }).json();
}

export function getRoom(id: string): Promise<Room> {
  return client.get(`room/${id}`).json();
}

export function joinRoom(roomId: string, name: string): Promise<Room> {
  return client.put(`room/${roomId}/join`, { json: { name } }).json();
}

export function leaveRoom(roomId: string, peerId: string): Promise<Room> {
  return client.put(`room/${roomId}/leave`, { json: { peerId } }).json();
}
