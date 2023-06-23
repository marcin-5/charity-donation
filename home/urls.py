from django.urls import path

from .views import AddDonationView, LandingPageView, get_institutions

app_name = "home"

urlpatterns = [
    path("", LandingPageView.as_view(), name="home"),
    path("form/", AddDonationView.as_view(), name="form"),
    path("institutions/", get_institutions),
]
