defmodule StreamcastApi.Repo.Migrations.CreatePeers do
  use Ecto.Migration

  def change do
    create table(:peers, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string
      add :room_id, references(:rooms, type: :binary_id)

      timestamps(type: :utc_datetime)
    end
  end
end
