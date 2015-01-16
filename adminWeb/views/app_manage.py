#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Blueprint, render_template, request, url_for, \
    redirect, session, flash
from flask.ext.login import login_required, current_user
from .profile import app
from ..models import Profile


@app.route('/appmanager/', methods=['GET', 'POST'])
@login_required
def app_manager():
    if request.method == 'POST' and request.form:
        app_name = request.form.get('app_name', '')
        current_user.account

