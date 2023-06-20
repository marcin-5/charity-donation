from django.contrib.auth import logout
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views import View

from users.models import Account


def logout_view(request):
    logout(request)
    return redirect(reverse("home:home"))


class LoginView(View):
    def get(self, request):
        return render(request, "users/login.html")


class RegisterView(View):
    def _create_ctx(self, d=None):
        fields = ("first_name", "last_name", "email", "password")
        return {key: d.get(key, "") for key in fields} if d else {}

    def get(self, request, **kwargs):
        return render(request, "users/register.html", context=self._create_ctx(kwargs))

    def post(self, request):
        ctx = self._create_ctx(request.POST)
        return redirect(reverse("users:login")) if Account.objects.create_user(**ctx) else self.get(request, **ctx)
