import re

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseNotFound
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views import View

from home.models import Donation
from users.models import Account


def logout_view(request):
    logout(request)
    return redirect(reverse("home:home"))


class LoginView(View):
    def get(self, request):
        return render(request, "users/login.html")

    def post(self, request):
        if user := authenticate(email=request.POST.get("email"), password=request.POST.get("password")):
            if user.is_active:
                login(request, user)
                return redirect(reverse("home:home"))
        return redirect(reverse("users:register"))


class RegisterView(View):
    def _create_ctx(self, d=None):
        fields = ("first_name", "last_name", "email", "password", "password2", "uid", "pass", "err")
        return {key: d.get(key, "") for key in fields} if d else {}

    def get(self, request, **kwargs):
        if request.user.is_authenticated:
            if request.GET.get("password") == "change":
                kwargs["pass"] = "change" + "d" * (kwargs.get("pass") is not None)
            elif "uid" not in kwargs:
                kwargs["uid"] = request.user.id
                kwargs.update(Account.objects.filter(id=request.user.id).values("first_name", "last_name")[0])
        return render(request, "users/register.html", context=self._create_ctx(kwargs))

    def post(self, request):
        ctx = self._create_ctx(request.POST)
        if not (p := ctx["password"]) or len(p) < 8:
            ctx["err"] += "Hasło zbyt krótkie.\n"
        if "password2" in ctx and ctx["password2"] != p:
            ctx["err"] += "Hasła nie są takie same.\n"
        if "first_name" in ctx and not ctx["first_name"]:
            ctx["err"] += "Musisz podać imię.\n"
        if "last_name" in ctx and not ctx["last_name"]:
            ctx["err"] += "Musisz podać nazwisko.\n"
        if "email" in ctx:
            if not ctx["email"]:
                ctx["err"] += "Musisz podać email.\n"
            elif not re.match(r"([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+", ctx["email"]):
                ctx["err"] += "Email jest nieprawidłowy.\n"
        if not ctx["email"] and request.user.is_authenticated:
            if user := Account.objects.filter(pk=request.user.id):
                if user[0].check_password(ctx["password"]):
                    user.update(first_name=ctx["first_name"], last_name=ctx["last_name"])
                    return self.get(request, uid=None)
                else:
                    if (p := request.POST.get("password")) == request.POST.get("password2"):
                        user[0].set_password(p)
                        user[0].save()
                        return self.get(request, **{"uid": None, "pass": "changed"})
            return self.get(request, **ctx)
        if ctx["err"]:
            ctx["err"] = ctx["err"].split("\n")
            return self.get(request, **ctx)
        return (
            render(request, "users/login.html", {"email": ctx["email"]})
            if Account.objects.create_user(**ctx)
            else self.get(request, **ctx)
        )


@login_required
def account_detail(request):
    if request.method == "GET":
        return render(request, "users/account-detail.html", {"donations": Donation.objects.filter(user=request.user)})
    else:
        return HttpResponseNotFound("404")
