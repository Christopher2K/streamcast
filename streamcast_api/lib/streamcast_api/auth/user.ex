defmodule StreamcastApi.Auth.User do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query, warn: false

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "users" do
    field :name, :string
    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end

  def queryable(), do: from(u in __MODULE__, as: :user)
  def filter_by(queryable, :id, id), do: queryable |> where([u], u.id == ^id)
  def filter_by(queryable, :name, name), do: queryable |> where([u], u.name == ^name)
end
