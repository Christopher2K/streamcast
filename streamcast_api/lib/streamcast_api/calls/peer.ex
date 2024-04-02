defmodule StreamcastApi.Calls.Peer do
  alias StreamcastApi.Auth.User
  alias StreamcastApi.Calls.Room

  use Ecto.Schema
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
end
