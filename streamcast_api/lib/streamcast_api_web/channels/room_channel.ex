defmodule StreamcastApiWeb.RoomChannel do
  use StreamcastApiWeb, :channel

  alias StreamcastApiWeb.Presence
  alias StreamcastApi.Calls
  alias StreamcastApi.Auth

  @impl true
  def join("room:" <> room_id, _payload, socket) do
    with {:ok, user} <- Auth.get_user(socket.assigns.user_id),
         {:ok, _room} <- Calls.add_peer_to_room(user, room_id) do
      send(self(), :after_join)
      {:ok, Presence.list(socket), socket}
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

  @impl true
  def handle_in("rtc:offer", %{"to" => to, "sdp" => sdp, "type" => type}, socket) do
    StreamcastApiWeb.Endpoint.broadcast("peer:" <> to, "rtc:offer:received", %{
      "from" => socket.assigns.user_id,
      "type" => type,
      "sdp" => sdp
    })

    {:noreply, socket}
  end

  def handle_in("rtc:answer", %{"to" => to, "sdp" => sdp, "type" => type}, socket) do
    StreamcastApiWeb.Endpoint.broadcast("peer:" <> to, "rtc:answer:received", %{
      "from" => socket.assigns.user_id,
      "type" => type,
      "sdp" => sdp
    })

    {:noreply, socket}
  end

  def handle_in("rtc:ice_candidate", %{"to" => to, "candidate" => candidate}, socket) do
    StreamcastApiWeb.Endpoint.broadcast("peer:" <> to, "rtc:ice_candidate:received", %{
      "from" => socket.assigns.user_id,
      "candidate" => candidate
    })

    {:noreply, socket}
  end
end
