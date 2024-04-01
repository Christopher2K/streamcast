defmodule StreamcastApiWeb.RoomController do
  use StreamcastApiWeb, :controller

  @doc """
  Create a room for people to join in
  """
  def create(conn) do
    # params = conn.body_params
  end

  @doc """
  Return a room informations
  """
  def show(conn, %{"id" => id}) do
    conn |> render(%{"hello" => "world"})
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
