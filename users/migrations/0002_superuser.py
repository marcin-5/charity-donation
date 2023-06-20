from os import environ

from django.db import migrations


def create_superuser(apps, schema_editor):
    User = apps.get_model("users", "Account")
    User.objects.create_superuser(
        email=environ.get("SU_EMAIL"),
        first_name=environ.get("SU_FIRST_NAME"),
        last_name=environ.get("SU_LAST_NAME"),
        password=environ.get("SU_PASSWORD"),
    )


def delete_superuser(apps, schema_editor):
    User = apps.get_model("users", "Account")
    admin = User.objects.get(pk=1)
    if admin.is_superuser:
        admin.delete()
    else:
        raise IndexError("User with id=1 is not an admin.")


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [migrations.RunPython(create_superuser, delete_superuser)]
