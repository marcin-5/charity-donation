from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class AccountManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        user = self.model(
            email=self.normalize_email(email), first_name=first_name, last_name=last_name, **extra_fields
        )
        user.password = make_password(password)
        user.is_active = True
        user.save(using=self.db)
        return user

    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        user = self.create_user(
            email=email, first_name=first_name, last_name=last_name, password=password, **extra_fields
        )
        user.is_superuser = True
        user.save(using=self.db)
        return user


class Account(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=60, unique=True)
    first_name = models.CharField(max_length=15)
    last_name = models.CharField(max_length=30)

    is_active = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = AccountManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email
