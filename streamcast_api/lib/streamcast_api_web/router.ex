defmodule StreamcastApiWeb.Router do
  use StreamcastApiWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", StreamcastApiWeb do
    pipe_through :api

    post "/room", RoomController, :create
    get "/room/:id", RoomController, :show
    put "/room/join/:id", RoomController, :join
    put "/room/leave/:id", RoomController, :leave
    delete "/room/:id", RoomController, :close

    post "/auth/login", AuthController, :login
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:streamcast_api, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: StreamcastApiWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
