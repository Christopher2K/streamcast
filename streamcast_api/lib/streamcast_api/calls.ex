defmodule StreamcastApi.Calls do
  @moduledoc """
  The Calls context.
  """
  import Ecto.Query, warn: false

  alias StreamcastApi.Repo
  alias StreamcastApi.Auth.User
  alias StreamcastApi.Calls.Room
  alias StreamcastApi.Calls.Peer

  def get_room!(id), do: Repo.get!(Room, id)

  def create_room(attrs \\ %{}) do
    %Room{}
    |> Room.changeset(attrs)
    |> Repo.insert()
  end

  @spec add_peer_to_room(User.t(), String.t()) :: {:ok, Room.t()} | {:error, any()}
  def add_peer_to_room(user, room_id) do
    mb_existing_peer =
      Peer.queryable()
      |> Peer.filter_by(:user, user.id)
      |> Peer.filter_by(:room, room_id)
      |> Repo.one()

    # TODO: Opportunity to write that in a better way with `case`
    if mb_existing_peer do
      room =
        Room.queryable()
        |> Room.filter_by(:id, room_id)
        |> Room.include(:peers)
        |> Repo.one()

      {:ok, room}
    else
      with {:ok, _} <-
             %Peer{}
             |> Peer.changeset(%{
               "name" => user.name,
               "room_id" => room_id,
               "user_id" => user.id
             })
             |> Repo.insert() do
        room =
          Room.queryable()
          |> Room.filter_by(:id, room_id)
          |> Room.include(:peers)
          |> Repo.one()

        {:ok, room}
      end
    end
  end
end
