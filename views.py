import json
from django.contrib.auth import authenticate, login, logout
from django.core import serializers
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.db import IntegrityError
from django.http import JsonResponse
from datetime import datetime, timedelta, timezone
from django.forms import ModelForm
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail


from .models import User, Barrel, Account, Note, Alert

# form for adding a new Barrel


class AddNewBarrel(ModelForm):

    class Meta:
        model = Barrel
        fields = ['title', 'beer_style', 'barrel_category',
                  'fill_date', 'estimated_ABV', 'description', 'pull_date', ]
        exclude = ['add_date', 'archived', 'bookmarked', 'owner', 'alert_off']


def index(request):
    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "tracker/index.html")

    # Everyone else is prompted to sign in
    else:
        return render(request, "tracker/login.html")


def add_barrel(request):
    # adding a new barrel must be via POST
    if request.method == 'POST':
        account = Account.objects.get(account_owner=request.user)
        user = User.objects.get(username=request.user)
        form = AddNewBarrel(request.POST, request.FILES)
        if form.is_valid():
            new_barrel = form.save(commit=False)
            new_barrel.owner = user
            new_barrel.add_date = datetime.now()
            new_barrel.archived = False
            new_barrel.bookmarked = False
            new_barrel.alert_off = False
            new_barrel.save()
            account.barrel_count = account.barrel_count + 1
            account.save()
        return redirect('tracker:index')
    else:
        # if GET, use the form AddNewBarrel()
        account = Account.objects.get(account_owner=request.user)
        return render(request, "tracker/add.html", {
            "form": AddNewBarrel(),
            "barrel_count": account.barrel_count
        })


# delete barrel based on ID
@csrf_exempt
def delete_barrel(request, barrel_id):
    # Query for requested barrel
    if request.method == "DELETE":
        barrel = Barrel.objects.get(pk=barrel_id)
        barrel.delete()
    return JsonResponse({"Success": "barrel deleted"}, status=204)

# bookmark barrel based on ID


@csrf_exempt
def bookmark_barrel(request, barrel_id):
    # Query for requested barrel
    if request.method == "PUT":
        # If request.method == PUT and the barrel exists
        try:
            barrel = Barrel.objects.get(pk=barrel_id)
            data = json.loads(request.body)
            if data.get("bookmarked") is not None:
                barrel.bookmarked = data["bookmarked"]
            barrel.save()
            return HttpResponse(status=204)

        # otherwise, return this error
        except Barrel.DoesNotExist:
            return JsonResponse({"error": "barrel not found."}, status=404)


# unbookmark barrel based on ID
@csrf_exempt
def unbookmark_barrel(request, barrel_id):
    # Query for requested barrel
    if request.method == "PUT":
        # If request.method == PUT and the barrel exists
        try:
            barrel = Barrel.objects.get(pk=barrel_id)
            data = json.loads(request.body)
            if data.get("bookmarked") is not None:
                barrel.bookmarked = data["bookmarked"]
            barrel.save()
            return HttpResponse(status=204)

        # otherwise, return this error
        except Barrel.DoesNotExist:
            return JsonResponse({"error": "barrel not found."}, status=404)


# archive barrel based on ID
@csrf_exempt
def archive_barrel(request, barrel_id):
    # Query for requested barrel
    if request.method == "PUT":
        # If request.method == PUT and the barrel exists
        try:
            barrel = Barrel.objects.get(pk=barrel_id)
            data = json.loads(request.body)
            if data.get("archived") is not None:
                barrel.archived = data["archived"]
            barrel.save()
            return HttpResponse(status=204)

        # otherwise, return this error
        except Barrel.DoesNotExist:
            return JsonResponse({"error": "barrel not found."}, status=404)

# unarchive barrel based on ID


@csrf_exempt
def unarchive_barrel(request, barrel_id):
    # Query for requested barrel
    if request.method == "PUT":
        try:
            barrel = Barrel.objects.get(pk=barrel_id)
            data = json.loads(request.body)
            if data.get("archived") is not None:
                barrel.archived = data["archived"]
            barrel.save()
            return HttpResponse(status=204)

        except Barrel.DoesNotExist:
            return JsonResponse({"error": "barrel not found."}, status=404)


# load account of user
def load_account(request):
    # Query for requested user
    if request.method == "GET":
        account = Account.objects.get(account_owner=request.user)
        return JsonResponse(account.serialize())


# load single barrel based on ID
def single_barrel_load(request, barrel_id):
    # Query for requested barrel
    if request.method == "GET":
        barrel = Barrel.objects.get(pk=barrel_id)

    return JsonResponse(barrel.serialize())


def load_notes(request, barrel_id):
    # Query for notes on requested barrel
    if request.method == "GET":
        try:
            notes = Note.objects.filter(note_barrel=barrel_id)
            return JsonResponse([note.serialize() for note in notes], safe=False)
    # return notes in JSON format
        except Note.DoesNotExist:
            return JsonResponse({"error": "Notes not found."}, status=404)


# adds to note to barrel based on id
@csrf_exempt
def add_note(request, barrel_id):
    if request.method == "POST":
        # Query for single barrel
        barrel = Barrel.objects.get(pk=barrel_id)
        data = json.loads(request.body)
        if data.get("content") is not None:
            content = data["content"]
            # creates Note with necessary parameters
            note = Note(
                note_barrel=barrel,
                note_author=request.user,
                note_timestamp=datetime.now(),
                content=content
            )
        note.save()
        return JsonResponse({"Success": "Note has been added"}, status=204)


# implements changes on account
@csrf_exempt
def edit_account(request):
    # query for requested account
    if request.method == 'PUT':
        user = User.objects.get(username=request.user.username)
        data = json.loads(request.body)
        if data.get("username") is not None:
            user.username = data["username"]
        user.save()
        if data.get("email") is not None:
            user.email = data["email"]
        user.save()
        return JsonResponse({"Success": "Your changes have been saved"}, status=204)


@csrf_exempt
def start_alerts(request, barrel_id):
    # query for requested barrel
    if request.method == 'PUT':
        try:
            barrel = Barrel.objects.get(pk=barrel_id)
            data = json.loads(request.body)
            if data.get("alert_off") is not None:
                barrel.alert_off = data["alert_off"]
            barrel.save()
            return HttpResponse(status=204)

        except Barrel.DoesNotExist:
            return JsonResponse({"error": "barrel not found."}, status=404)


@csrf_exempt
def stop_alerts(request, barrel_id):
    # query for requested barrel
    if request.method == 'PUT':
        try:
            barrel = Barrel.objects.get(pk=barrel_id)
            data = json.loads(request.body)
            if data.get("alert_off") is not None:
                barrel.alert_off = data["alert_off"]
            barrel.save()
            return HttpResponse(status=204)

        except Barrel.DoesNotExist:
            return JsonResponse({"error": "barrel not found."}, status=404)


def load_alerts(request):
    # query for alerts
    if request.method == 'GET':
        try:
            alerts = Alert.objects.filter(alert_user=request.user)
            # return notes in JSON format
            alerts = alerts.order_by("-alert_timestamp").all()
            return JsonResponse([alert.serialize() for alert in alerts], safe=False)

        except Alert.DoesNotExist:
            return JsonResponse({"error": "Notes not found."}, status=404)


@csrf_exempt
def read_alerts(request):
    # query for alerts
    if request.method == 'PUT':
        try:
            alerts = Alert.objects.filter(alert_read=False)
            data = json.loads(request.body)
            if data.get("alert_read") is not None:
                for alert in alerts:
                    alert.alert_read = data["alert_read"]
                    alert.save()
            return HttpResponse(status=204)

        except Alert.DoesNotExist:
            return JsonResponse({"error": "alert not found."}, status=404)


# search/filter function that filters barrels by beer style
def filter(request, filter_params, filter_params2, filter_params3):
    if request.method == "GET":
        if filter_params == 'All':
            barrels = Barrel.objects.filter(owner=request.user)
        else:
            barrels = Barrel.objects.filter(beer_style=filter_params)

        if filter_params2 == 'Both':
            results = barrels.all()
        elif filter_params2 == 'Archived':
            results = barrels.filter(archived=True)
        else:
            filter_params2 == 'Unarchived'
            results = barrels.filter(archived=False)

        if filter_params3 == 'All':
            final_results = results
        else:
            final_results = results.filter(barrel_category=filter_params3)

        if final_results.count() == 0:
            return JsonResponse({"error": "You have no barrels in this category"}, status=404)

        final_results = final_results.order_by("-add_date").all()
        return JsonResponse([final_result.serialize() for final_result in final_results], safe=False)


# filters barrels based on build_view, sending JSON back as a response
def build_barrels(request, build_view):

    if build_view == "archived":
        barrels = Barrel.objects.filter(archived=True, owner=request.user)

    elif build_view == "bookmarked":
        barrels = Barrel.objects.filter(owner=request.user, bookmarked=True)

    else:
        barrels = Barrel.objects.filter(owner=request.user, archived=False)

    if barrels.count() == 0:
        return JsonResponse({"error": "You have no barrels in this category"}, status=404)

    barrels = barrels.order_by("-add_date").all()
    return JsonResponse([barrel.serialize() for barrel in barrels], safe=False)

    # remember,'None' is not the same as 0,False,or an empty string. It'sa datatype of its own - the Nonetype


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in

        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            # creates alerts. if alert_off = YES, dont create the alert
            barrels = Barrel.objects.filter(
                owner=request.user, archived=False, alert_off=False)
            three_days = datetime.now(timezone.utc) + timedelta(days=3)
            for barrel in barrels:
                if barrel.pull_date <= three_days:
                    alert = Alert(
                        alert_user=request.user,
                        alert_timestamp=datetime.now(),
                        alert_message=f"{barrel.title} needs to be pulled soon!",
                        alert_read=False,
                        alert_barrel=barrel,
                    )
                    alert.save()
            return render(request, "tracker/index.html")

        else:
            return render(request, "tracker/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "tracker/login.html")


def logout_view(request):
    logout(request)
    return render(request, "tracker/login.html")


def register(request):
    if request.method == "POST":
        email = request.POST["email"]
        username = request.POST["username"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "tracker/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            Account.objects.create(account_owner=user)
        except IntegrityError as e:
            print(e)
            return render(request, "tracker/register.html", {
                "message": "Email address already taken."
            })
        login(request, user)
        return render(request, "tracker/index.html")
    else:
        return render(request, "tracker/register.html")

