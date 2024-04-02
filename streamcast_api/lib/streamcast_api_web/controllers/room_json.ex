defmodule StreamcastApiWeb.RoomJSON do
  def single_room(%{room: room}) do
    %{
      "id" => room.id,
      "name" => room.name
    }
  end
end
