defmodule StreamcastApiWeb.AuthJSON do
  def user(%{user: user}) do
    %{
      id: user.id,
      name: user.name
    }
  end
end
