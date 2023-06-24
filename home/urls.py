from django.urls import path

from .views import AddDonationView, LandingPageView, get_institutions, add_donation, form_confirmation

app_name = "home"

urlpatterns = [
    path("", LandingPageView.as_view(), name="home"),
    path("form/", AddDonationView.as_view(), name="form"),
    path("institutions/", get_institutions),
    path("add-donation/", add_donation),
    path("form-confirmation/", form_confirmation),
]
