defmodule StreamcastApi.Calls do
  @moduledoc """
  The Calls context.
  """

  import Ecto.Query, warn: false
  alias StreamcastApi.Repo

  alias StreamcastApi.Calls.Room

  @doc """
  Returns the list of rooms.

  ## Examples

      iex> list_rooms()
      [%Room{}, ...]

  """
  def list_rooms do
    Repo.all(Room)
  end

  @doc """
  Gets a single room.

  Raises `Ecto.NoResultsError` if the Room does not exist.

  ## Examples

      iex> get_room!(123)
      %Room{}

      iex> get_room!(456)
      ** (Ecto.NoResultsError)

  """
  def get_room!(id), do: Repo.get!(Room, id)

  @doc """
  Creates a room.

  ## Examples

      iex> create_room(%{field: value})
      {:ok, %Room{}}

      iex> create_room(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_room(attrs \\ %{}) do
    %Room{}
    |> Room.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a room.

  ## Examples

      iex> update_room(room, %{field: new_value})
      {:ok, %Room{}}

      iex> update_room(room, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_room(%Room{} = room, attrs) do
    room
    |> Room.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a room.

  ## Examples

      iex> delete_room(room)
      {:ok, %Room{}}

      iex> delete_room(room)
      {:error, %Ecto.Changeset{}}

  """
  def delete_room(%Room{} = room) do
    Repo.delete(room)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking room changes.

  ## Examples

      iex> change_room(room)
      %Ecto.Changeset{data: %Room{}}

  """
  def change_room(%Room{} = room, attrs \\ %{}) do
    Room.changeset(room, attrs)
  end

  alias StreamcastApi.Calls.Peer

  @doc """
  Returns the list of peers.

  ## Examples

      iex> list_peers()
      [%Peer{}, ...]

  """
  def list_peers do
    Repo.all(Peer)
  end

  @doc """
  Gets a single peer.

  Raises `Ecto.NoResultsError` if the Peer does not exist.

  ## Examples

      iex> get_peer!(123)
      %Peer{}

      iex> get_peer!(456)
      ** (Ecto.NoResultsError)

  """
  def get_peer!(id), do: Repo.get!(Peer, id)

  @doc """
  Creates a peer.

  ## Examples

      iex> create_peer(%{field: value})
      {:ok, %Peer{}}

      iex> create_peer(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_peer(attrs \\ %{}) do
    %Peer{}
    |> Peer.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a peer.

  ## Examples

      iex> update_peer(peer, %{field: new_value})
      {:ok, %Peer{}}

      iex> update_peer(peer, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_peer(%Peer{} = peer, attrs) do
    peer
    |> Peer.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a peer.

  ## Examples

      iex> delete_peer(peer)
      {:ok, %Peer{}}

      iex> delete_peer(peer)
      {:error, %Ecto.Changeset{}}

  """
  def delete_peer(%Peer{} = peer) do
    Repo.delete(peer)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking peer changes.

  ## Examples

      iex> change_peer(peer)
      %Ecto.Changeset{data: %Peer{}}

  """
  def change_peer(%Peer{} = peer, attrs \\ %{}) do
    Peer.changeset(peer, attrs)
  end

  @doc """
  Start a new room with a single one peer
  """
  def start_new_room(%{"name" => name, "peerName" => peer_name}) do
  end
end
