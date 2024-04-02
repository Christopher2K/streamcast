defmodule StreamcastApiWeb.RoomChannel do
  use StreamcastApiWeb, :channel

  alias StreamcastApiWeb.Presence
  alias StreamcastApi.Calls
  alias StreamcastApi.Auth

  @impl true
  def join("room:" <> room_id, _payload, socket) do
    with {:ok, user} <- Auth.get_user(socket.assigns.user_id),
         {:ok, room} <- Calls.add_peer_to_room(user, room_id) do
      send(self(), :after_join)
      {:ok, Calls.Room.to_json(room), socket}
    end
  end

  @impl true
  def terminate(_reason, socket) do
    Presence.untrack(socket, socket.assigns.user_id)
    broadcast(socket, "presence:update", Presence.list(socket))
    broadcast(socket, "presence:left", %{"userId" => socket.assigns.user_id})
  end

  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        online_at: inspect(System.system_time(:second))
      })

    broadcast(socket, "presence:update", Presence.list(socket))
    broadcast(socket, "presence:joined", %{"userId" => socket.assigns.user_id})
    {:noreply, socket}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  def handle_in("client:join", _payload, socket) do
    {:noreply, socket}
  end

  def handle_in("client:leave", _payload, socket) do
    {:noreply, socket}
  end
end
