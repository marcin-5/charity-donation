from django.urls import path

from .views import LoginView, RegisterView, logout_view, account_detail

app_name = "users"

urlpatterns = [
    path('logout/', logout_view, name='logout'),
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("settings/", RegisterView.as_view(), name="settings"),
    path("account-detail/", account_detail, name="account-detail"),
]
