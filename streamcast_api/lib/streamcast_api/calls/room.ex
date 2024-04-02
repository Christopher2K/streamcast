defmodule StreamcastApi.Calls.Room do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias StreamcastApi.Calls.Peer

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t(),
          # Association
          peers: list(String.t())
        }

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "rooms" do
    field :name, :string
    has_many :peers, Peer

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end

  def to_json(%__MODULE__{} = room) do
    %{
      "id" => room.id,
      "name" => room.name,
      "peers" => room.peers |> Enum.map(fn peer -> Peer.to_json(peer) end)
    }
  end

  def queryable() do
    from(r in __MODULE__, as: :room)
  end

  def filter_by(queryable, :id, id), do: queryable |> where([r], r.id == ^id)
  def include(queryable, included), do: queryable |> preload([r], ^included)
end
