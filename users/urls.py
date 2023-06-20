from django.urls import path

from .views import LoginView, RegisterView, logout_view

app_name = "users"

urlpatterns = [
    path('logout/', logout_view, name='logout'),
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),
]
