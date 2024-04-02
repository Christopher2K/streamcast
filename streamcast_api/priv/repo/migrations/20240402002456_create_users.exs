defmodule StreamcastApi.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, :name)

    alter table(:peers) do
      add :user_id, references(:users, type: :binary_id)
    end
  end
end
