from django.core import serializers
from django.core.paginator import Paginator
from django.db.models import Sum
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views import View

from home.models import Donation, Institution, Category


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
        if not request.user.is_authenticated:
            return redirect(reverse("users:login"))
        ctx = {
            "categories": Category.objects.all(),
            "institutions": Institution.objects.all(),
        }
        return render(request, "home/form.html", ctx)


def get_institutions(request):
    if request.method == "POST":
        categories = list(map(int, request.POST["categories"].split(",")))
        return HttpResponse(
            serializers.serialize("json", Institution.objects.filter(categories__in=categories).distinct()),
            content_type="application/json",
        )
    else:
        return HttpResponseNotFound("404")


def get_institutions_api(request):
    if request.method == "GET":
        page_number = request.GET.get("page", 1)
        per_page = request.GET.get("per_page", 5)
        if _type := request.GET.get("type", ""):
            institutions = Institution.objects.filter(type=_type)
        else:
            institutions = Institution.objects.all()
        paginator = Paginator(institutions, per_page)
        page_obj = paginator.get_page(page_number)
        data = serializers.serialize("json", page_obj.object_list)
        payload = {
            "page": {
                "current": page_obj.number,
                "num_pages": paginator.num_pages,
                "has_next": page_obj.has_next(),
                "has_previous": page_obj.has_previous(),
            },
            "data": data,
            "categories": [list(i.categories.values_list("name", flat=True)) for i in institutions],
        }
        return JsonResponse(payload)
    else:
        return HttpResponseNotFound("404")


def add_donation(request):
    if request.method == "POST":
        ctx = {}
        for key in (
            "quantity",
            "categories",
            "institution_id",
            "address",
            "phone_number",
            "city",
            "zip_code",
            "pick_up_date",
            "pick_up_time",
            "pick_up_comment",
        ):
            ctx[key] = request.POST.get(key)

        categories = Category.objects.filter(id__in=ctx["categories"].split(","))
        del ctx["categories"]
        ctx["user"] = request.user

        donation = Donation.objects.create(**ctx)
        donation.categories.set(categories)
        return JsonResponse({"donation": donation.pk})
    else:
        return HttpResponseNotFound("404")


def form_confirmation(request):
    if request.method == "GET":
        return render(request, "home/form-confirmation.html")
    else:
        return HttpResponseNotFound("404")
