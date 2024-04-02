defmodule StreamcastApi.Calls.Peer do
  use Ecto.Schema

  alias StreamcastApi.Auth.User
  alias StreamcastApi.Calls.Room

  import Ecto.Query, warn: false
  import Ecto.Changeset

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t(),
          room_id: String.t(),
          user_id: String.t(),
          # Associations
          room: Room.t(),
          user: User.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "peers" do
    field :name, :string
    belongs_to :room, Room
    belongs_to :user, User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(peer, attrs) do
    peer
    |> cast(attrs, [:name, :room_id, :user_id])
    |> validate_required([:name, :room_id, :user_id])
  end

  def to_json(%__MODULE__{} = peer) do
    %{
      "id" => peer.id,
      "name" => peer.name,
      "user_id" => peer.user_id
    }
  end

  def queryable(), do: from(p in __MODULE__, as: :peer)
  def filter_by(queryable, :user, user_id), do: queryable |> where([p], p.user_id == ^user_id)
  def filter_by(queryable, :room, room_id), do: queryable |> where([p], p.room_id == ^room_id)
end
