defmodule StreamcastApiWeb.AuthController do
  use StreamcastApiWeb, :controller

  alias StreamcastApi.Auth

  def login(%Plug.Conn{} = conn, _) do
    params = conn.params
    # TODO: Proper error handling here
    {:ok, user} = Auth.login(params)
    render(conn, :user, user: user)
  end
end
