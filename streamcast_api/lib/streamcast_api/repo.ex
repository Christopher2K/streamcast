defmodule StreamcastApi.Repo do
  use Ecto.Repo,
    otp_app: :streamcast_api,
    adapter: Ecto.Adapters.Postgres
end
