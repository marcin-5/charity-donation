from django.db import models

from users.models import Account


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Institution(models.Model):
    class OrganisationType(models.TextChoices):
        F = "F", "fundacja"
        OP = "OP", "organizacja pozarządowa"
        ZL = "ZL", "zbiórka lokalna"

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    type = models.CharField(max_length=2, choices=OrganisationType.choices, default=OrganisationType.F)
    categories = models.ManyToManyField(Category)

    class Meta:
        ordering = ("type", "name")

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Donation(models.Model):
    quantity = models.IntegerField()
    categories = models.ManyToManyField(Category)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    address = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=12)
    city = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=6)
    pick_up_date = models.DateField()
    pick_up_time = models.TimeField()
    pick_up_comment = models.TextField(blank=True)
    user = models.ForeignKey(Account, null=True, on_delete=models.CASCADE)
