defmodule StreamcastApi.Auth do
  @moduledoc """
  The Auth context.
  """

  import Ecto.Query, warn: false
  alias StreamcastApi.Repo

  alias StreamcastApi.Auth.User

  @spec login(map()) :: {:ok, User.t()} | {:error, Ecto.ChangeError.t()}
  def login(%{"name" => name} = attrs) do
    existing_user =
      User.queryable()
      |> User.filter_by(:name, name)
      |> Repo.one()

    if existing_user do
      {:ok, existing_user}
    else
      %User{}
      |> User.changeset(attrs)
      |> Repo.insert()
    end
  end
end
