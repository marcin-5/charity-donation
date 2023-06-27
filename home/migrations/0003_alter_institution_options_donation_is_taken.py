# Generated by Django 4.2.2 on 2023-06-27 17:41

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("home", "0002_alter_donation_phone_number"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="institution",
            options={"ordering": ("type", "name")},
        ),
        migrations.AddField(
            model_name="donation",
            name="is_taken",
            field=models.BooleanField(default=False),
        ),
    ]
