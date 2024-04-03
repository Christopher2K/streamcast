defmodule StreamcastApiWeb.PeerChannel do
  use StreamcastApiWeb, :channel

  @impl true
  def join("peer:" <> user_id, _payload, socket) do
    if user_id == socket.assigns.user_id do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end
end
