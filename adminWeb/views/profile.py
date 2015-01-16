#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
from flask import Blueprint, render_template, request, url_for, \
    redirect, session, flash
from flask.ext.login import login_required, login_user, logout_user
from .. import excepts
from ..models import Profile
from ..config import login_manager

reload(sys)
sys.setdefaultencoding('utf8')

app = Blueprint('profile', __name__)


@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for('.signin'))


@login_manager.user_loader
def load_user(userid):
    return Profile.find(id=userid)


@app.route('/signup/', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST' and request.form:
        email = request.form.get('email', '')
        password = request.form.get('password', '')
        try:
            user = Profile.create(email, password)
        except excepts.DumpOperate:
            flash("用户名已存在")
            return render_template('access/AdminLogin.html')
        except:
            flash("未知错误")
            return render_template('access/AdminLogin.html')

        login_user(user, remember=True)
        return redirect(url_for('.admin_index'))
    else:
        return render_template('access/AdminLogin.html')


@app.route('/signin/', methods=['GET', 'POST'])
def signin():
    if request.method == 'POST' and request.form:
        email = request.form.get('email', '')
        password = request.form.get('password', '')
        user = Profile.find(email=email)
        if not user:
            flash("用户名不存在")
            return render_template('access/AdminLogin.html')
        if not user.check_password(password):
            flash("密码错误")
            return render_template('access/AdminLogin.html')
        login_user(user, remember=True)
        return redirect(url_for('.admin_index'))
    else:
        return render_template('access/AdminLogin.html')


@app.route('/signout/')
@login_required
def signout():
    logout_user()
    return redirect(url_for('.signin'))


@app.route('/')
@login_required
def admin_index():
    return render_template('index/index.html')


@app.route('/test/', methods=['GET'])
def test():
    email = 'rui.chen@tcl.com'
    password = 'Aa123456'
    user = Profile.create(email, password)
    print user.id
