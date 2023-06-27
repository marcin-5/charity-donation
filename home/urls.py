from django.urls import path

from .views import (
    AddDonationView,
    LandingPageView,
    get_institutions,
    get_institutions_api,
    add_donation,
    form_confirmation,
    switch_is_taken,
)

app_name = "home"

urlpatterns = [
    path("", LandingPageView.as_view(), name="home"),
    path("form/", AddDonationView.as_view(), name="form"),
    path("institutions/", get_institutions),
    path("institutions.json", get_institutions_api),
    path("add-donation/", add_donation),
    path("form-confirmation/", form_confirmation),
    path("is-taken/", switch_is_taken),
]
