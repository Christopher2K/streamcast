defmodule StreamcastApiWeb.RoomController do
  alias StreamcastApi.Calls
  use StreamcastApiWeb, :controller

  @doc """
  Create a room for people to join in
  """
  def create(conn, _) do
    params = conn.body_params

    with {:ok, room} <- Calls.create_room(params) do
      render(conn, :single_room, room: room)
    end
  end

  @doc """
  Return a room informations
  """
  def show(conn, %{"id" => id}) do
    room = Calls.get_room!(id)
    conn |> render(:single_room, room: room)
  end

  @doc """
  Join a specific room with their people in it
  """
  def join(conn) do
  end

  @doc """
  Leave a room
  """
  def leave(conn) do
  end

  @doc """
  Close a room and eject everyone
  """
  def close() do
  end
end
