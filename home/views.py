from django.db.models import Sum
from django.shortcuts import render
from django.views import View

from home.models import Donation, Institution


class LandingPageView(View):
    def get(self, request):
        ctx = {
            "sum_": Donation.objects.aggregate(Sum("quantity"))["quantity__sum"] or 0,
            "len_": Donation.objects.values("institution").distinct().count(),
            "foundations": Institution.objects.filter(type="F"),
            "organizations": Institution.objects.filter(type="OP"),
            "collections": Institution.objects.filter(type="ZL"),
        }
        return render(request, "home/index.html", ctx)


class AddDonationView(View):
    def get(self, request):
        return render(request, "home/form.html")
