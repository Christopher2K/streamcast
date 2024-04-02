defmodule StreamcastApiWeb.Presence do
  use Phoenix.Presence,
    otp_app: :streamcast_api,
    pubsub_server: StreamcastApi.PubSub
end
