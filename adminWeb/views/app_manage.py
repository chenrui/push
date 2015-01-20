#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Blueprint, render_template, request, url_for, \
    redirect, session, flash
from flask.ext.login import login_required, current_user
from ..models import Profile
from .. import excepts
from .profile import app


@app.route('/appmanager/list', methods=['GET'])
@login_required
def show_app_list():
    apps = current_user.find_apps()
    return render_template('index/applist.html', apps=apps)


@app.route('/appmanager/<app_key>', methods=['GET', 'POST', 'DELETE'])
@login_required
def app_detail(app_key):
    if request.method == 'GET':
        apps = current_user.find_apps(app_key)
        return render_template('index/appdetail.html', app=apps[0])
    elif request.method == 'DELETE':
        current_user.delete_app(app_key)
        return redirect(url_for('.show_app_list'))
    elif request.method == 'POST' and request.form:
        # TODO: xxxx
        return redirect(url_for('.app_detail'))


@app.route('/appmanager/new', methods=['GET', 'POST'])
@login_required
def new_app():
    # current_user.add_app('testapp')
    # return redirect(url_for('.show_app_list'))
    if request.method == 'POST' and request.form:
        app_name = request.form.get('app_name', '')
        try:
            current_user.add_app(app_name)
        except excepts.DumpOperate:
            flash("应用名已存在")
            return render_template('index/appcreate.html')
        except:
            flash("未知错误")
            return render_template('index/appcreate.html')
        return redirect(url_for('.show_app_list'))
    elif request.method == 'GET':
        return render_template('index/appcreate.html')
